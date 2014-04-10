'use strict';

/**
 * @ngdoc module
 * @name sails.io
 *
 *
 * @description
 *
 * This file allows you to send and receive socket.io messages to & from Sails
 * by simulating a REST client interface on top of socket.io.
 *
 * It models its API after the $http pattern from Angular and returns $q promises.
 *
 * So if you're switching from using $http to $sailsSocket, instead of:
 *  `$http.post( url, [data]).then( successHandler, errorHandler )`
 *
 * You would use:
 *    `$sailsSocket.post( url, [data]).then( successHandler, errorHandler )`
 *
 * It also supports $http-style success / error callbacks:
 *  ` $sailsSocket.get( url, [params] )
 *      .success(function(results){})
 *      .error(function(results){}) `
 *
 *
 * For more information, visit:
 * http://github.com/balderdashy/angularSails
 *
 *  * Code from :
 *
 * - angular-socket-io by Brian Ford : https://github.com/btford/angular-socket-io
 *
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 *
 * sails.io.js by Balderdashy : https://github.com/balderdashy/sails
 *
 *
 */







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
             * @name $sailsSocket
             * @requires ng.$sailsBackend
             * @requires $cacheFactory
             * @requires $rootScope
             * @requires $q
             * @requires $injector
             *
             * @description
             * The `$sailsSocket` service is a core Angular service that facilitates communication with sails via socket.io
             *
             * For unit testing applications that use `$http` service, see
             * {@link ngMock.$httpBackend $httpBackend mock}.
             *
             * For a higher level of abstraction, please check out the {@link ngsails.$sailsResource $sailsResource} service.
             *
             * The $sailsSocket API is based on the {@link ng.$q deferred/promise APIs} exposed by
             * the $q service. While for simple usage patterns this doesn't matter much, for advanced usage
             * it is important to familiarize yourself with these APIs and the guarantees they provide.
             *
             *
             * # General usage
             * The `$sailsSocket` service is a function which takes a single argument — a configuration object —
             * that is used to generate an HTTP request and returns  a {@link ng.$q promise}
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
             * A response status code between 200 and 299 is considered a success status and
             * will result in the success callback being called. Note that if the response is a redirect,
             * XMLHttpRequest will transparently follow it, meaning that the error callback will not be
             * called for such responses.
             *
             * # Writing Unit Tests that use $sailsSocket
             * When unit testing (using {@link ngMock ngMock}), it is necessary to call
             * {@link ngMock.$sailsSocketBackend#flush $sailsSocketBackend.flush()} to flush each pending
             * request using trained responses.
             *
             * ```
             * $sailsSocketBackend.expectGET(...);
             * $sailsSocket.get(...);
             * $sailsSocketBackend.flush();
             * ```
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
             * - {@link ng.$sailsSocket#get $sailsSocket.get}
             * - {@link ng.$sailsSocket#head $sailsSocket.head}
             * - {@link ng.$sailsSocket#post $sailsSocket.post}
             * - {@link ng.$sailsSocket#put $sailsSocket.put}
             * - {@link ng.$sailsSocket#delete $sailsSocket.delete}
             * - {@link ng.$sailsSocket#jsonp $sailsSocket.jsonp}
             *
             *
             * # Setting HTTP Headers
             *
             * The $sailsSocket service will automatically add certain HTTP headers to all requests. These defaults
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
             *
             * # Caching
             *
             * To enable caching, set the request configuration `cache` property to `true` (to use default
             * cache) or to a custom cache object (built with {@link ng.$cacheFactory `$cacheFactory`}).
             * When the cache is enabled, `$sailsSocket` stores the response from the server in the specified
             * cache. The next time the same request is made, the response is served from the cache without
             * sending a request to the server.
             *
             * Note that even if the response is served from cache, delivery of the data is asynchronous in
             * the same way that real requests are.
             *
             * If there are multiple GET requests for the same URL that should be cached using the same
             * cache, but the cache is not populated yet, only one request to the server will be made and
             * the remaining requests will be fulfilled using the response from the first request.
             *
             * You can change the default cache to a new object (built with
             * {@link ng.$cacheFactory `$cacheFactory`}) by updating the
             * {@link ng.$sailsSocket#properties_defaults `$sailsSocket.defaults.cache`} property. All requests who set
             * their `cache` property to `true` will now use this cache object.
             *
             * If you set the default cache to `false` then only requests that specify their own custom
             * cache object will be cached.
             *
             * # Interceptors
             *
             * Before you start creating interceptors, be sure to understand the
             * {@link ng.$q $q and deferred/promise APIs}.
             *
             * For purposes of global error handling, authentication, or any kind of synchronous or
             * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
             * able to intercept requests before they are handed to the server and
             * responses before they are handed over to the application code that
             * initiated these requests. The interceptors leverage the {@link ng.$q
     * promise APIs} to fulfill this need for both synchronous and asynchronous pre-processing.
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
             *   $sailsSocketProvider.interceptors.push('myHttpInterceptor');
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
             * ```
             *
             * # Response interceptors (DEPRECATED)
             *
             * Before you start creating interceptors, be sure to understand the
             * {@link ng.$q $q and deferred/promise APIs}.
             *
             * For purposes of global error handling, authentication or any kind of synchronous or
             * asynchronous preprocessing of received responses, it is desirable to be able to intercept
             * responses for http requests before they are handed over to the application code that
             * initiated these requests. The response interceptors leverage the {@link ng.$q
     * promise apis} to fulfil this need for both synchronous and asynchronous preprocessing.
             *
             * The interceptors are service factories that are registered with the $sailsSocketProvider by
             * adding them to the `$sailsSocketProvider.responseInterceptors` array. The factory is called and
             * injected with dependencies (if specified) and returns the interceptor  — a function that
             * takes a {@link ng.$q promise} and returns the original or a new promise.
             *
             * ```js
             *   // register the interceptor as a service
             *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return function(promise) {
     *       return promise.then(function(response) {
     *         // do something on success
     *         return response;
     *       }, function(response) {
     *         // do something on error
     *         if (canRecover(response)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(response);
     *       });
     *     }
     *   });
             *
             *   $sailsSocketProvider.responseInterceptors.push('myHttpInterceptor');
             *
             *
             *   // register the interceptor via an anonymous factory
             *   $sailsSocketProvider.responseInterceptors.push(function($q, dependency1, dependency2) {
     *     return function(promise) {
     *       // same as above
     *     }
     *   });
             * ```
             *
             *
             * # Security Considerations
             *
             * When designing web applications, consider security threats from:
             *
             * - [JSON vulnerability](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx)
             * - [XSRF](http://en.wikipedia.org/wiki/Cross-site_request_forgery)
             *
             * Both server and the client must cooperate in order to eliminate these threats. Angular comes
             * pre-configured with strategies that address these issues, but for this to work backend server
             * cooperation is required.
             *
             * ## JSON Vulnerability Protection
             *
             * A [JSON vulnerability](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx)
             * allows third party website to turn your JSON resource URL into
             * [JSONP](http://en.wikipedia.org/wiki/JSONP) request under some conditions. To
             * counter this your server can prefix all JSON requests with following string `")]}',\n"`.
             * Angular will automatically strip the prefix before processing it as JSON.
             *
             * For example if your server needs to return:
             * ```js
             * ['one','two']
             * ```
             *
             * which is vulnerable to attack, your server can return:
             * ```js
             * )]}',
             * ['one','two']
             * ```
             *
             * Angular will strip the prefix, before processing the JSON.
             *
             *
             * ## Cross Site Request Forgery (XSRF) Protection
             *
             * [XSRF](http://en.wikipedia.org/wiki/Cross-site_request_forgery) is a technique by which
             * an unauthorized site can gain your user's private data. Angular provides a mechanism
             * to counter XSRF. When performing XHR requests, the $sailsSocket service reads a token from a cookie
             * (by default, `XSRF-TOKEN`) and sets it as an HTTP header (`X-XSRF-TOKEN`). Since only
             * JavaScript that runs on your domain could read the cookie, your server can be assured that
             * the XHR came from JavaScript running on your domain. The header will not be set for
             * cross-domain requests.
             *
             * To take advantage of this, your server needs to set a token in a JavaScript readable session
             * cookie called `XSRF-TOKEN` on the first HTTP GET request. On subsequent XHR requests the
             * server can verify that the cookie matches `X-XSRF-TOKEN` HTTP header, and therefore be sure
             * that only JavaScript running on your domain could have sent the request. The token must be
             * unique for each user and must be verifiable by the server (to prevent the JavaScript from
             * making up its own tokens). We recommend that the token is a digest of your site's
             * authentication cookie with a [salt](https://en.wikipedia.org/wiki/Salt_(cryptography))
             * for added security.
             *
             * The name of the headers can be specified using the xsrfHeaderName and xsrfCookieName
             * properties of either $sailsSocketProvider.defaults at config-time, $sailsSocket.defaults at run-time,
             * or the per-request config object.
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
             *      {@link ng.$cacheFactory $cacheFactory}, this cache will be used for
             *      caching.
             *    - **timeout** – `{number|Promise}` – timeout in milliseconds, or {@link ng.$q promise}
             *      that should abort the request when resolved.
             *    - **withCredentials** - `{boolean}` - whether to to set the `withCredentials` flag on the
             *      XHR object. See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5
             *      for more information.
             *    - **responseType** - `{string}` - see
             *      [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
             *
             * @returns {HttpPromise} Returns a {@link ng.$q promise} object with the
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
             *
             * @example
             <example>
             <file name="index.html">
             <div ng-controller="FetchCtrl">
             <select ng-model="method">
             <option>GET</option>
             <option>JSONP</option>
             </select>
             <input type="text" ng-model="url" size="80"/>
             <button id="fetchbtn" ng-click="fetch()">fetch</button><br>
             <button id="samplegetbtn" ng-click="updateModel('GET', 'http-hello.html')">Sample GET</button>
             <button id="samplejsonpbtn"
             ng-click="updateModel('JSONP',
             'http://angularjs.org/greet.php?callback=JSON_CALLBACK&name=Super%20Hero')">
             Sample JSONP
             </button>
             <button id="invalidjsonpbtn"
             ng-click="updateModel('JSONP', 'http://angularjs.org/doesntexist&callback=JSON_CALLBACK')">
             Invalid JSONP
             </button>
             <pre>http status code: {{status}}</pre>
             <pre>http response data: {{data}}</pre>
             </div>
             </file>
             <file name="script.js">
             function FetchCtrl($scope, $sailsSocket, $templateCache) {
    $scope.method = 'GET';
    $scope.url = 'http-hello.html';

    $scope.fetch = function() {
      $scope.code = null;
      $scope.response = null;

      $sailsSocket({method: $scope.method, url: $scope.url, cache: $templateCache}).
        success(function(data, status) {
          $scope.status = status;
          $scope.data = data;
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
      });
    };

    $scope.updateModel = function(method, url) {
      $scope.method = method;
      $scope.url = url;
    };
  }
             </file>
             <file name="http-hello.html">
             Hello, $sailsSocket!
             </file>
             <file name="protractor.js" type="protractor">
             var status = element(by.binding('status'));
             var data = element(by.binding('data'));
             var fetchBtn = element(by.id('fetchbtn'));
             var sampleGetBtn = element(by.id('samplegetbtn'));
             var sampleJsonpBtn = element(by.id('samplejsonpbtn'));
             var invalidJsonpBtn = element(by.id('invalidjsonpbtn'));

             it('should make an xhr GET request', function() {
    sampleGetBtn.click();
    fetchBtn.click();
    expect(status.getText()).toMatch('200');
    expect(data.getText()).toMatch(/Hello, \$sailsSocket!/);
  });

             it('should make a JSONP request to angularjs.org', function() {
    sampleJsonpBtn.click();
    fetchBtn.click();
    expect(status.getText()).toMatch('200');
    expect(data.getText()).toMatch(/Super Hero!/);
  });

             it('should make JSONP request to invalid URL and invoke the error handler',
             function() {
    invalidJsonpBtn.click();
    fetchBtn.click();
    expect(status.getText()).toMatch('0');
    expect(data.getText()).toMatch('Request failed');
  });
             </file>
             </example>
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
             * @name $sailsSocket#jsonp
             *
             * @description
             * Shortcut method to perform `JSONP` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request.
             *                     Should contain `JSON_CALLBACK` string.
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */
            createShortMethods('get', 'delete', 'head', 'jsonp');

            /**
             * @ngdoc method
             * @name $sailsSocket#post
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
             *
             * @description
             * Shortcut method to perform `PUT` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */
            createShortMethodsWithData('post', 'put');

            /**
             * @ngdoc property
             * @name $sailsSocket#defaults
             *
             * @description
             * Runtime equivalent of the `$sailsSocketProvider.defaults` property. Allows configuration of
             * default headers, withCredentials as well as request and response transformations.
             *
             * See "Setting HTTP Headers" and "Transforming Requests and Responses" sections above.
             */
            $sailsSocket.defaults = defaults;
            $sailsSocket.subscribe = $sailsSocketBackend.subscribe;


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
'use strict';
// NOTE:  The usage of window and document instead of $window and $document here is
// deliberate.  This service depends on the specific behavior of anchor nodes created by the
// browser (resolving and parsing URLs) that is unlikely to be provided by mock objects and
// cause us to break tests.  In addition, when the browser resolves a URL for XHR, it
// doesn't know about mocked locations and resolves URLs to the real document - which is
// exactly the behavior needed here.  There is little value is mocking these out for this
// service.
var urlParsingNode = document.createElement("a");
var originUrl = urlResolve(window.location.href, true);

/**
 * Chain all given functions
 *
 * This function is used for both request and response transforming
 *
 * @param {*} data Data to transform.
 * @param {function(string=)} headers Http headers getter fn.
 * @param {(Function|Array.<Function>)} fns Function or an array of functions.
 * @returns {*} Transformed data.
 */
function transformData(data, headers, fns) {
    if (isFunction(fns))
        return fns(data, headers);

    forEach(fns, function(fn) {
        data = fn(data, headers);
    });

    return data;
}


function isSuccess(status) {
    return 200 <= status && status < 300;
}


/**
 * Parse headers into key value object
 *
 * @param {string} headers Raw headers as a string
 * @returns {Object} Parsed headers as key value object
 */
function parseHeaders(headers) {
    var parsed = {}, key, val, i;

    if (!headers) return parsed;

    forEach(headers.split('\n'), function(line) {
        i = line.indexOf(':');
        key = lowercase(trim(line.substr(0, i)));
        val = trim(line.substr(i + 1));

        if (key) {
            if (parsed[key]) {
                parsed[key] += ', ' + val;
            } else {
                parsed[key] = val;
            }
        }
    });

    return parsed;
}
/**
 * Returns a function that provides access to parsed headers.
 *
 * Headers are lazy parsed when first requested.
 * @see parseHeaders
 *
 * @param {(string|Object)} headers Headers to provide access to.
 * @returns {function(string=)} Returns a getter function which if called with:
 *
 *   - if called with single an argument returns a single header value or null
 *   - if called with no arguments returns an object containing all headers.
 */
function headersGetter(headers) {
    var headersObj = isObject(headers) ? headers : undefined;

    return function(name) {
        if (!headersObj) headersObj =  parseHeaders(headers);

        if (name) {
            return headersObj[lowercase(name)] || null;
        }

        return headersObj;
    };
}

function urlResolve(url, base) {
    var href = url;

    if (typeof msie !== 'undefined') {
        // Normalize before parse.  Refer Implementation Notes on why this is
        // done in two steps on IE.
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}

/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The url of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function urlIsSameOrigin(requestUrl) {
    var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
    return (parsed.protocol === originUrl.protocol &&
        parsed.host === originUrl.host);
}

function buildUrl(url, params) {
    if (!params) return url;
    var parts = [];
    angular.forEach(params, function(value, key) {
        if (value === null || angular.isUndefined(value)) return;
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
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn) {
    return function(value, key) { iteratorFn(key, value); };
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


function valueFn(value) {return function() {return value;};}


function isUndefined(value){return typeof value === 'undefined';}


function isDefined(value){return typeof value !== 'undefined';}
function isObject(value){return value != null && typeof value === 'object';}
function isString(value){return typeof value === 'string';}
function isNumber(value){return typeof value === 'number';}
function isDate(value){
    return toString.call(value) === '[object Date]';
}
function isFunction(value){return typeof value === 'function';}

function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
}
function isFile(obj) {
    return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
    return typeof value === 'boolean';
}

function isArray(value) {
    return toString.call(value) === '[object Array]';
}


/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}

function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;

function mergeHeaders(config) {
    var defHeaders = defaults.headers,
        reqHeaders = extend({}, config.headers),
        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

    defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

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

var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};
var manualUppercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}
/**
 * @ngdoc function
 * @name angular.toJson
 * @module ng
 * @function
 *
 * @description
 * Serializes input into a JSON-formatted string. Properties with leading $ characters will be
 * stripped since angular uses this notation internally.
 *
 * @param {Object|Array|Date|string|number} obj Input to be serialized into JSON.
 * @param {boolean=} pretty If set to true, the JSON output will contain newlines and whitespace.
 * @returns {string|undefined} JSON-ified string representing `obj`.
 */
function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}


/**
 * @ngdoc function
 * @name angular.fromJson
 * @module ng
 * @function
 *
 * @description
 * Deserializes a JSON string.
 *
 * @param {string} json JSON string to deserialize.
 * @returns {Object|Array|string|number} Deserialized thingy.
 */
function fromJson(json) {
    return isString(json)
        ? JSON.parse(json)
        : json;
}

function size(obj, ownPropsOnly) {
    var count = 0, key;

    if (isArray(obj) || isString(obj)) {
        return obj.length;
    } else if (isObject(obj)){
        for (key in obj)
            if (!ownPropsOnly || obj.hasOwnProperty(key))
                count++;
    }

    return count;
}


function includes(array, obj) {
    return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}

function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
        array.splice(index, 1);
    return value;
}


'use strict';

function createSailsBackend($browser, $window, $injector, $q, $timeout){


    if(!$window.io){
        throw new Error('socket.io client not found')
    }

    if(!$window.io.sails){
        throw new Error('sails.io client not found')
    }

    if(!$window.io.socket){
        console.warn('no connected socket...')
    }


    var tick = function (socket, callback) {
        return callback ? function () {
            var args = arguments;
            $timeout(function () {
                callback.apply(socket, args);
            }, 0);
        } : angular.noop;
    };


    function connection(method, url, post, callback, headers, timeout, withCredentials, responseType){



        function socketResponse(body,jwr){

            callback(jwr.statusCode,body);
            //status, response, headersString, statusText
        }


        url = url || $browser.url();


        $window.io.socket[method.toLowerCase()](url,fromJson(post),socketResponse);

    }

    //TODO normalize http paths to event names
    connection.subscribe = function(event,handler){
        $window.io.socket.on(event,tick($window.io.socket,handler));
    }

    return connection;

}

/**
 * @ngdoc service
 * @name $sailsSocketBackend
 * @requires $window
 * @requires $document
 *
 * @description
 * Service used by the {@link ngsails.$sailsSocket service} that delegates to a
 * Socket.io connection (or in theory, any connection type eventually)
 *
 * You should never need to use this service directly, instead use the higher-level abstractions:
 * {@link ngsails.$sailsSocket $sailsSocket} or {@link ngsails.$sailsResource $sailsResource}.
 *
 * During testing this implementation is swapped with {@link ngsailsMock.$sailsBackend mock
 * $sailsBackend} which can be trained with responses.
 */
function sailsBackendProvider() {
    this.$get = ['$browser', '$window','$injector', '$q','$timeout', function($browser, $window, $injector, $q,$timeout) {
        return createSailsBackend($browser,$window, $injector, $q,$timeout);
    }];
}

