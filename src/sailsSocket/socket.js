'use strict';

/* global
 angularModule: true,

*/


/**
 * @ngdoc overview
 * @module ngsails
 * @name ngsails
 *
 * @description foobar
 *
 **/



function $sailsSocketProvider() {
    var JSON_START = /^\s*(\[|\{[^\{])/,
        JSON_END = /[\}\]]\s*$/,
        PROTECTION_PREFIX = /^\)\]\}',?\n/,
        CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8'};

    var defaults = this.defaults = {
        // transform incoming response data
        transformResponse: [function(data) {
            if (angular.isString(data)) {
                // strip json vulnerability protection prefix
                data = data.replace(PROTECTION_PREFIX, '');
                if (JSON_START.test(data) && JSON_END.test(data))
                    data = fromJson(data);
            }
            return data;
        }],

        // transform outgoing request data
        transformRequest: [function(d) {
            return isObject(d) && !isFile(d) && !isBlob(d) ? toJson(d) : d;
        }],

        // default headers
        headers: {
            common: {
                'Accept': 'application/json, text/plain, */*'
            },
            post:   angular.copy(CONTENT_TYPE_APPLICATION_JSON),
            put:    angular.copy(CONTENT_TYPE_APPLICATION_JSON),
            patch:  angular.copy(CONTENT_TYPE_APPLICATION_JSON)
        },

        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
    };

    /**
     * Are ordered by request, i.e. they are applied in the same order as the
     * array, on request, but reverse order, on response.
     */
    var interceptorFactories = this.interceptors = [];

    /**
     * For historical reasons, response interceptors are ordered by the order in which
     * they are applied to the response. (This is the opposite of interceptorFactories)
     */
    var responseInterceptorFactories = this.responseInterceptors = [];

    this.$get = ['$sailsSocketBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
        function($sailsSocketBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

            var defaultCache = $cacheFactory('$sailsSocket');

            /**
             * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
             * The reversal is needed so that we can build up the interception chain around the
             * server request.
             */
            var reversedInterceptors = [];

            angular.forEach(interceptorFactories, function(interceptorFactory) {
                reversedInterceptors.unshift(angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            });

            angular.forEach(responseInterceptorFactories, function(interceptorFactory, index) {
                var responseFn = angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory)
                    : $injector.invoke(interceptorFactory);

                /**
                 * Response interceptors go before "around" interceptors (no real reason, just
                 * had to pick one.) But they are already reversed, so we can't use unshift, hence
                 * the splice.
                 */
                reversedInterceptors.splice(index, 0, {
                    response: function(response) {
                        return responseFn($q.when(response));
                    },
                    responseError: function(response) {
                        return responseFn($q.reject(response));
                    }
                });
            });


            /**
             * @ngdoc service
             * @kind function
             * @name ngsails.$sailsSocket
             *
             * @requires $cacheFactory
             * @requires $rootScope
             * @requires $q
             * @requires $injector
             *
             *
             *
             * @description
             * The `$sailsSocket` service is the core service that facilitates communication with sails via socket.io
             *
             *
             * For a higher level of abstraction, please check out the $sailsResource service.
             *
             * The $sailsSocket API is based on the deferred/promise APIs exposed by
             * the $q service. While for simple usage patterns this doesn't matter much, for advanced usage
             * it is important to familiarize yourself with these APIs and the guarantees they provide.
             *
             *
             * # General usage
             * The `$sailsSocket` service is a function which takes a single argument — a configuration object —
             * that is used to generate a request and returns  a promise
             * with two $sailsSocket specific methods: `success` and `error`.
             *
             * ```js
             *   $sailsSocket({method: 'GET', url: '/someUrl'}).
             *     success(function(data, status, headers, config) {
     *       // this callback will be called asynchronously
     *       // when the response is available
     *     }).
             *     error(function(data, status, headers, config) {
     *       // called asynchronously if an error occurs
     *       // or server returns response with an error status.
     *     });
             * ```
             *
             * Since the returned value of calling the $sailsSocket function is a `promise`, you can also use
             * the `then` method to register callbacks, and these callbacks will receive a single argument –
             * an object representing the response. See the API signature and type info below for more
             * details.
             *
             * # Shortcut methods
             *
             * Shortcut methods are also available. All shortcut methods require passing in the URL, and
             * request data must be passed in for POST/PUT requests.
             *
             * ```js
             *   $sailsSocket.get('/someUrl').success(successCallback);
             *   $sailsSocket.post('/someUrl', data).success(successCallback);
             * ```
             *
             * Complete list of shortcut methods:
             *
             * - $sailsSocket.get
             * - $sailsSocket.head
             * - $sailsSocket.post
             * - $sailsSocket.put
             * - $sailsSocket.delete
             * - $sailsSocket.subscribe
             *
             *
             * # Setting Headers
             *
             * The $sailsSocket service will automatically add certain headers to all requests. These defaults
             * can be fully configured by accessing the `$sailsSocketProvider.defaults.headers` configuration
             * object, which currently contains this default configuration:
             *
             * - `$sailsSocketProvider.defaults.headers.common` (headers that are common for all requests):
             *   - `Accept: application/json, text/plain, * / *`
             * - `$sailsSocketProvider.defaults.headers.post`: (header defaults for POST requests)
             *   - `Content-Type: application/json`
             * - `$sailsSocketProvider.defaults.headers.put` (header defaults for PUT requests)
             *   - `Content-Type: application/json`
             *
             * To add or overwrite these defaults, simply add or remove a property from these configuration
             * objects. To add headers for an HTTP method other than POST or PUT, simply add a new object
             * with the lowercased HTTP method name as the key, e.g.
             * `$sailsSocketProvider.defaults.headers.get = { 'My-Header' : 'value' }.
             *
             * The defaults can also be set at runtime via the `$sailsSocket.defaults` object in the same
             * fashion. For example:
             *
             * ```
             * module.run(function($sailsSocket) {
     *   $sailsSocket.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
     * });
             * ```
             *
             * In addition, you can supply a `headers` property in the config object passed when
             * calling `$sailsSocket(config)`, which overrides the defaults without changing them globally.
             *
             *
             * # Transforming Requests and Responses
             *
             * Both requests and responses can be transformed using transform functions. By default, Angular
             * applies these transformations:
             *
             * Request transformations:
             *
             * - If the `data` property of the request configuration object contains an object, serialize it
             *   into JSON format.
             *
             * Response transformations:
             *
             *  - If XSRF prefix is detected, strip it (see Security Considerations section below).
             *  - If JSON response is detected, deserialize it using a JSON parser.
             *
             * To globally augment or override the default transforms, modify the
             * `$sailsSocketProvider.defaults.transformRequest` and `$sailsSocketProvider.defaults.transformResponse`
             * properties. These properties are by default an array of transform functions, which allows you
             * to `push` or `unshift` a new transformation function into the transformation chain. You can
             * also decide to completely override any default transformations by assigning your
             * transformation functions to these properties directly without the array wrapper.  These defaults
             * are again available on the $sailsSocket factory at run-time, which may be useful if you have run-time
             * services you wish to be involved in your transformations.
             *
             * Similarly, to locally override the request/response transforms, augment the
             * `transformRequest` and/or `transformResponse` properties of the configuration object passed
             * into `$sailsSocket`.
             *

             * # Interceptors
             *
             * Before you start creating interceptors, be sure to understand the
             * $q and deferred/promise APIs.
             *
             * For purposes of global error handling, authentication, or any kind of synchronous or
             * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
             * able to intercept requests before they are handed to the server and
             * responses before they are handed over to the application code that
             * initiated these requests. The interceptors leverage the promise APIs to fulfill this need for both synchronous and asynchronous pre-processing.
             *
             * The interceptors are service factories that are registered with the `$sailsSocketProvider` by
             * adding them to the `$sailsSocketProvider.interceptors` array. The factory is called and
             * injected with dependencies (if specified) and returns the interceptor.
             *
             * There are two kinds of interceptors (and two kinds of rejection interceptors):
             *
             *   * `request`: interceptors get called with http `config` object. The function is free to
             *     modify the `config` or create a new one. The function needs to return the `config`
             *     directly or as a promise.
             *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *   * `response`: interceptors get called with http `response` object. The function is free to
             *     modify the `response` or create a new one. The function needs to return the `response`
             *     directly or as a promise.
             *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *
             *
             * ```js
             *   // register the interceptor as a service
             *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return {
     *       // optional method
     *       'request': function(config) {
     *         // do something on success
     *         return config || $q.when(config);
     *       },
     *
     *       // optional method
     *      'requestError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       },
     *
     *
     *
     *       // optional method
     *       'response': function(response) {
     *         // do something on success
     *         return response || $q.when(response);
     *       },
     *
     *       // optional method
     *      'responseError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       }
     *     };
     *   });
             *
             *   $sailsSocketProvider.interceptors.push('mySocketInterceptor');
             *
             *
             *   // alternatively, register the interceptor via an anonymous factory
             *   $sailsSocketProvider.interceptors.push(function($q, dependency1, dependency2) {
     *     return {
     *      'request': function(config) {
     *          // same as above
     *       },
     *
     *       'response': function(response) {
     *          // same as above
     *       }
     *     };
     *   });

             *
             *
             * @param {object} config Object describing the request to be made and how it should be
             *    processed. The object has following properties:
             *
             *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
             *    - **url** – `{string}` – Absolute or relative URL of the resource that is being requested.
             *    - **params** – `{Object.<string|Object>}` – Map of strings or objects which will be turned
             *      to `?key1=value1&key2=value2` after the url. If the value is not a string, it will be
             *      JSONified.
             *    - **data** – `{string|Object}` – Data to be sent as the request message data.
             *    - **headers** – `{Object}` – Map of strings or functions which return strings representing
             *      HTTP headers to send to the server. If the return value of a function is null, the
             *      header will not be sent.
             *    - **xsrfHeaderName** – `{string}` – Name of HTTP header to populate with the XSRF token.
             *    - **xsrfCookieName** – `{string}` – Name of cookie containing the XSRF token.
             *    - **transformRequest** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      request body and headers and returns its transformed (typically serialized) version.
             *    - **transformResponse** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      response body and headers and returns its transformed (typically deserialized) version.
             *    - **cache** – `{boolean|Cache}` – If true, a default $sailsSocket cache will be used to cache the
             *      GET request, otherwise if a cache instance built with
             *      $cacheFactory, this cache will be used for
             *      caching.
             *    - **timeout** – `{number|Promise}` – timeout in milliseconds, or a promise
             *      that should abort the request when resolved.
             *    - **withCredentials** - `{boolean}` - whether to to set the `withCredentials` flag on the
             *      XHR object. See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5
             *      for more information.
             *    - **responseType** - `{string}` - see
             *      [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
             *
             * @returns {Promise} Returns a promise object with the
             *   standard `then` method and two http specific methods: `success` and `error`. The `then`
             *   method takes two arguments a success and an error callback which will be called with a
             *   response object. The `success` and `error` methods take a single argument - a function that
             *   will be called when the request succeeds or fails respectively. The arguments passed into
             *   these functions are destructured representation of the response object passed into the
             *   `then` method. The response object has these properties:
             *
             *   - **data** – `{string|Object}` – The response body transformed with the transform
             *     functions.
             *   - **status** – `{number}` – HTTP status code of the response.
             *   - **headers** – `{function([headerName])}` – Header getter function.
             *   - **config** – `{Object}` – The configuration object that was used to generate the request.
             *   - **statusText** – `{string}` – HTTP status text of the response.
             *
             * @property {Array.<Object>} pendingRequests Array of config objects for currently pending
             *   requests. This is primarily meant to be used for debugging purposes.
             *

             */

            function $sailsSocket(requestConfig) {
                var config = {
                    method: 'get',
                    transformRequest: defaults.transformRequest,
                    transformResponse: defaults.transformResponse
                };
                var headers = mergeHeaders(requestConfig);

                angular.extend(config, requestConfig);
                config.headers = headers;
                config.method = uppercase(config.method);

                var xsrfValue = urlIsSameOrigin(config.url)
                    ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName]
                    : undefined;
                if (xsrfValue) {
                    headers[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                }


                var serverRequest = function(config) {
                    headers = config.headers;
                    var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

                    // strip content-type if data is undefined
                    if (isUndefined(config.data)) {
                        forEach(headers, function(value, header) {
                            if (lowercase(header) === 'content-type') {
                                delete headers[header];
                            }
                        });
                    }

                    if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
                        config.withCredentials = defaults.withCredentials;
                    }

                    // send request
                    return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                };

                var chain = [serverRequest, undefined];
                var promise = $q.when(config);

                // apply interceptors
                forEach(reversedInterceptors, function(interceptor) {
                    if (interceptor.request || interceptor.requestError) {
                        chain.unshift(interceptor.request, interceptor.requestError);
                    }
                    if (interceptor.response || interceptor.responseError) {
                        chain.push(interceptor.response, interceptor.responseError);
                    }
                });

                while(chain.length) {
                    var thenFn = chain.shift();
                    var rejectFn = chain.shift();

                    promise = promise.then(thenFn, rejectFn);
                }

                promise.success = function(fn) {
                    promise.then(function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                return promise;

                function transformResponse(response) {
                    // make a copy since the response must be cacheable
                    var resp = angular.extend({}, response, {
                        data: transformData(response.data, response.headers, config.transformResponse)
                    });
                    return (isSuccess(response.status))
                        ? resp
                        : $q.reject(resp);
                }

                function mergeHeaders(config) {
                    var defHeaders = defaults.headers,
                        reqHeaders = angular.extend({}, config.headers),
                        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

                    defHeaders = angular.extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                    // execute if header value is function
                    execHeaders(defHeaders);
                    execHeaders(reqHeaders);

                    // using for-in instead of forEach to avoid unecessary iteration after header has been found
                    defaultHeadersIteration:
                        for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);

                            for (reqHeaderName in reqHeaders) {
                                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                    continue defaultHeadersIteration;
                                }
                            }

                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }

                    return reqHeaders;

                    function execHeaders(headers) {
                        var headerContent;

                        forEach(headers, function(headerFn, header) {
                            if (isFunction(headerFn)) {
                                headerContent = headerFn();
                                if (headerContent != null) {
                                    headers[header] = headerContent;
                                } else {
                                    delete headers[header];
                                }
                            }
                        });
                    }
                }
            }

            $sailsSocket.pendingRequests = [];

            /**
             * @ngdoc method
             * @name $sailsSocket#get
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `GET` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#delete
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `DELETE` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#head
             * @methodOf ngsails.$sailsSocket
             *
             *
             * @description
             * Shortcut method to perform `HEAD` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#subscribe
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Low-level method to register handlers for socket.io events.
             *
             * @param {string} eventName Name of server-emitted event to listen for.
             *
             * @param {Function} eventHandler Method to fire when event is recieved.
             *
             */
            createShortMethods('get', 'delete', 'head');

            /**
             * @ngdoc method
             * @name $sailsSocket#post
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `POST` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#put
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `PUT` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#on
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Subscribes to an incoming socket event
             *
             * @param {string} event socket event name to listen for.
             * @param {function} callback listener function
             * @returns {HttpPromise} Future object
             */

            $sailsSocket.subscribe = $sailsSocketBackend.subscribe;



            createShortMethodsWithData('post', 'put');

            /**
             * @ngdoc property
             * @name $sailsSocket#defaults
             * @propertyOf ngsails.$sailsSocket
             *
             *
             * @description
             * Runtime equivalent of the `$sailsSocketProvider.defaults` property. Allows configuration of
             * default headers, withCredentials as well as request and response transformations.
             *
             * See "Setting HTTP Headers" and "Transforming Requests and Responses" sections above.
             */
            $sailsSocket.defaults = defaults;



            return $sailsSocket;


            function createShortMethods(names) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url
                        }));
                    };
                });
            }


            function createShortMethodsWithData(name) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, data, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url,
                            data: data
                        }));
                    };
                });
            }


            /**
             * Makes the request.
             *
              */
            function sendReq(config, reqData, reqHeaders) {
                var deferred = $q.defer(),
                    promise = deferred.promise,
                    cache,
                    cachedResp,
                    url = buildUrl(config.url, config.params);

                $sailsSocket.pendingRequests.push(config);
                promise.then(removePendingReq, removePendingReq);


                if ((config.cache || defaults.cache) && config.cache !== false && config.method == 'GET') {
                    cache = isObject(config.cache) ? config.cache
                        : isObject(defaults.cache) ? defaults.cache
                        : defaultCache;
                }

                if (cache) {
                    cachedResp = cache.get(url);
                    if (isDefined(cachedResp)) {
                        if (cachedResp.then) {
                            // cached request has already been sent, but there is no response yet
                            cachedResp.then(removePendingReq, removePendingReq);
                            return cachedResp;
                        } else {
                            // serving from cache
                            if (isArray(cachedResp)) {
                                resolvePromise(cachedResp[1], cachedResp[0], angular.copy(cachedResp[2]), cachedResp[3]);
                            } else {
                                resolvePromise(cachedResp, 200, {}, 'OK');
                            }
                        }
                    } else {
                        // put the promise for the non-transformed response into cache as a placeholder
                        cache.put(url, promise);
                    }
                }

                // if we won't have the response in cache, send the request to the backend
                if (angular.isUndefined(cachedResp)) {
                    $sailsSocketBackend(config.method, url, reqData, done, reqHeaders, config.timeout,
                        config.withCredentials, config.responseType);
                }

                return promise;


                /**
                 * Callback registered to $sailsSocketBackend():
                 *  - caches the response if desired
                 *  - resolves the raw $sailsSocket promise
                 *  - calls $apply
                 */
                function done(status, response, headersString, statusText) {
                    if (cache) {
                        if (isSuccess(status)) {
                            cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                        } else {
                            // remove promise from the cache
                            cache.remove(url);
                        }
                    }

                    resolvePromise(response, status, headersString, statusText);
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }


                /**
                 * Resolves the raw $sailsSocket promise.
                 */
                function resolvePromise(response, status, headers, statusText) {
                    // normalize internal statuses to 0
                    status = Math.max(status, 0);

                    (isSuccess(status) ? deferred.resolve : deferred.reject)({
                        data: response,
                        status: status,
                        headers: headersGetter(headers),
                        config: config,
                        statusText : statusText
                    });
                }


                function removePendingReq() {
                    var idx = indexOf($sailsSocket.pendingRequests, config);
                    if (idx !== -1) $sailsSocket.pendingRequests.splice(idx, 1);
                }
            }


            function buildUrl(url, params) {
                if (!params) return url;
                var parts = [];
                forEachSorted(params, function(value, key) {
                    if (value === null || isUndefined(value)) return;
                    if (!isArray(value)) value = [value];

                    angular.forEach(value, function(v) {
                        if (isObject(v)) {
                            v = toJson(v);
                        }
                        parts.push(encodeUriQuery(key) + '=' +
                            encodeUriQuery(v));
                    });
                });
                if(parts.length > 0) {
                    url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
                }
                return url;
            }


        }];
}

angular.module('sails.io', []).provider('$sailsSocket',$sailsSocketProvider).provider('$sailsSocketBackend',sailsBackendProvider);