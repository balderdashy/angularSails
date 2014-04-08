'use strict';

/**
 * @ngdoc module
 * @name sails.io
 * @file ngSails.io.js
 *
 * @description
 *
 * This file allows you to send and receive socket.io messages to & from Sails
 * by simulating a REST client interface on top of socket.io.
 *
 * It models its API after the $http pattern from Angular and returns $q promises.
 *
 * So if you're switching from using AJAX to sockets, instead of:
 *  `$http.post( url, [data]).then( successHandler, errorHandler )`
 *
 * You would use:
 *    `socket.post( url, [data]).then( successHandler, errorHandler )`
 *
 * It also supports $http-style success / error callbacks:
 *  ` socket.get( url, [params] )
 *      .success(function(results){})
 *      .error(function(results){}) `
 *
 *
 * For more information, visit:
 * http://github.com/balderdashy/angularSails
 */
angular.module('sails.io', [])


/**
 * @ngdoc constant
 * @name sails.io.$$sailsConnectionMetaData
 *
 * @description
 *
 * //TODO
 *
 */
    .constant('$sailsSocketConstants', {

        version: '__sails_io_sdk_version',
        platform: '__sails_io_sdk_platform',
        language: '__sails_io_sdk_language'

    })

    .constant('$sailsSocketParams', {

        version: '0.10.0',  // TODO: pull this automatically from package.json during build.
        platform: typeof module === 'undefined' ? 'browser' : 'node',
        language: 'javascript',
        flavor: 'angular'

    })

/**
 * @ngdoc factory
 * @name sails.io.$SAILS_SDK_INFO
 *
 * @description
 *
 * //TODO
 *
 */
    .factory('$$sailsSDKInfo', ['$sailsSocketConstants', '$sailsSocketParams', function ($$sailsConnectionMetaData, $$sailsSDKParams) {

        function _getVersionString() {

            var versionString = $$sailsConnectionMetaData.version + '=' +
                $$sailsSDKParams.version + '&' + $$sailsConnectionMetaData.platform + '=' +
                $$sailsSDKParams.platform + '&' + $$sailsConnectionMetaData.language + '=' +
                $$sailsSDKParams.language;

            return versionString;
        }

        return {
            getVersionString: _getVersionString
        };

    }])

    .factory('SocketIo', ['$window', function ($window) {
        if (!$window.io) {
            throw new Error('Socket IO Not Found!');
        }
        return $window.io;

    }])


/**
 * @ngdoc provider
 * @name sails.io.$sailsSocket
 *
 * @description
 *
 * This provider returns a service that allows you to create a connection to a Sails server via socket.io.
 *
 *
 *
 * Code from :
 *
 * - angular-socket-io by Brian Ford : https://github.com/btford/angular-socket-io
 *
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 *
 * sails.io.js by Balderdashy : https://github.com/balderdashy/sails
 */

    .provider('$sailsSocket', function () {

        var _socketDefaults = {
            autoConnect: true,
            environment: 'development',
            url: 'http://localhost:1337'
        };

        var CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8'};

        var _providerDefaults  = this.defaults = {
            // transform incoming response data
            transformResponse: [function(data) {

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


        var SailsSocketFactory = function ($window,$http,$httpBackend,$browser, $q, $timeout, SocketIo, $$sailsSDKInfo) {


            var versionString = $$sailsSDKInfo.getVersionString();

            var tick = function (socket, callback) {
                return callback ? function () {
                    var args = arguments;
                    $timeout(function () {
                       callback.apply(socket, args);
                    }, 0);
                } : angular.noop;
            };

            /**
             * TmpSocket
             *
             * A mock Socket used for binding events before the real thing
             * has been instantiated (since we need to use io.connect() to
             * instantiate the real thing, which would kick off the connection
             * process w/ the server, and we don't necessarily have the valid
             * configuration to know WHICH SERVER to talk to yet.)
             *
             * @api private
             * @constructor
             */

            function TmpSocket() {
                var boundEvents = {};

                this.socket = {connected: false};

                this.on = function (evName, fn) {
                    boundEvents[evName] = fn;
                    return this;
                };
                this.become = function (actualSocket) {
                    for (var eventName in boundEvents) {
                        actualSocket.on(eventName, boundEvents[eventName]);

                        // boundEvents[eventName] = angular.noop;
                    }
                    return actualSocket;
                };
            }


            /**
             * @ngDoc function
             * @name angularSails.io.SailsResponse
             *
             * @description
             *
             * Transforms a raw sails response into a $http-like responseObject
             *
             * @param requestContext
             * @param responseContext
             * @constructor
             */

            function SailsResponse(requestContext, responseContext) {

                if(angular.isString(responseContext)){
                    responseContext = angular.fromJson(responseContext);

                }

                this.data = responseContext.body || {};
                this.headers = responseContext.headers || {};
                this.status = responseContext.statusCode || 200;
                this.config = requestContext;

            }


            function _sendRequest(socket, request) {

               var response = $q.defer();

                response.promise.success = function (fn) {
                    response.promise.then(function (response) {
                        fn(response.data, response.statusCode, response.headers, request);
                    });
                    return response.promise;
                };

                response.promise.error = function (fn) {
                    response.promise.then(null, function (response) {
                        fn(response.data, response.statusCode, response.headers, request);
                    });
                    return response.promise;
                };
                // Name of socket request listener on the server
                // ( === the request method, e.g. 'get', 'post', 'put', etc. )
                var sailsEndpoint = request.method;


                socket.emit(sailsEndpoint, request, tick(socket, function serverResponded(responseCtx) {


                    var serverResponse = new SailsResponse(request, responseCtx);

                    if (serverResponse.status >= 400) {
                        response.reject(serverResponse);
                    }
                    else {
                        response.resolve(serverResponse);
                    }
                }));

                return response.promise;
            }

            /**
             * @ngDoc function
             * @name angularSails.io.SailsSocket
             *
             * @param options
             * @constructor
             */
            function SailsSocket(config) {

                config = config || _socketDefaults;
                var self = this;

                self._requestQueue = [];

                self._socket = new TmpSocket();

                var xsrfValue = urlIsSameOrigin(config.url)
                    ? $browser.cookies()[config.xsrfCookieName || _providerDefaults.xsrfCookieName]
                    : undefined;
                if (xsrfValue) {
                    headers[(config.xsrfHeaderName || _providerDefaults.xsrfHeaderName)] = xsrfValue;
                }


            };

            SailsSocket.prototype.connect = function (opts) {

                opts = opts || {};
                var connection = $q.defer();

//                if(options.XDomain){
//
//                }


                var self = this;


                // If explicit connection url is specified, use it
                var url = url || _socketDefaults.url || undefined;

                // Mix the current SDK version into the query string in
                // the connection request to the server:
                if (typeof opts.query !== 'string') opts.query = versionString;
                else opts.query += '&' + versionString;


                var socket = SocketIo.connect(url, opts,{'force new connection' : true});

                self._socket = self._socket.become(socket);

                self._socket.on('connect', function () {


                    angular.forEach(self._requestQueue, function (queuedRequest,idx) {

                        _sendRequest(self._socket, queuedRequest);


                    })
                })

                self._socket.once('connect', connection.resolve);
                self._socket.on('connecting', connection.notify);
                self._socket.once('connect_failed', connection.reject);

                return connection.promise;

            }

            SailsSocket.prototype.isConnected = function () {

                return this._socket.socket.connected;

            }

            SailsSocket.prototype.get = function (url, data) {


                return this._request({
                    method: 'get',
                    url: url,
                    data: data
                });
            };

            SailsSocket.prototype.post = function (url, data) {

                return this._request({
                    method: 'post',
                    url: url,
                    data: data
                });
            };
            SailsSocket.prototype.post = function (url, data) {

                return this._request({
                    method: 'post',
                    url: url,
                    data: data
                });
            };
            SailsSocket.prototype['delete'] = function (url, data) {

                return this._request({
                    method: 'delete',
                    url: url,
                    data: data
                });
            };

            SailsSocket.prototype._request = function (options) {

                var self = this;
                var usage = 'Usage:\n socket.' +
                    (options.method || 'request') +
                    '( destinationURL, [dataToSend] )';

                options = options || {};
                options.data = options.data || {};
                options.headers = options.headers || {};

                // Remove trailing slashes and spaces to make packets smaller.
                options.url = options.url.replace(/^(.+)\/*\s*$/, '$1');
                if (typeof options.url !== 'string') {
                    throw new Error('Invalid or missing URL!\n' + usage);
                }

                // Build a simulated request object.
                var request = {
                    method: options.method,
                    data: options.data,
                    url: options.url,
                    headers: options.headers,

                };

                var response = _sendRequest(self._socket,request);



                return response;



            };

            SailsSocket.prototype.on = function (eventName, callback) {

                var self = this;

                self._socket.on(eventName, tick(self._socket, callback));

            };


            function doPreflightRequest(url){

                return $http.get(host + '/__getCookie');

            }

            return function (options) {


                var sailSocket = new SailsSocket(options);

                sailSocket.connect();

                return sailSocket;

            }

        };

        return {
            '$get': ['$window','$http','$httpBackend','$browser','$q', '$timeout', 'SocketIo', '$$sailsSDKInfo', SailsSocketFactory ]
        }
    });
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
 *
 * Implementation Notes for non-IE browsers
 * ----------------------------------------
 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
 * URL will be resolved into an absolute URL in the context of the application document.
 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
 * properties are all populated to reflect the normalized URL.  This approach has wide
 * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
 * http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *
 * Implementation Notes for IE
 * ---------------------------
 * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
 * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
 * work around that by performing the parsing in a 2nd step by taking a previously normalized
 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
 * properties such as protocol, hostname, port, etc.
 *
 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
 * Unfortunately, setting img[src] to something like "javascript:foo" on IE throws an exception.
 * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
 * method and IE < 8 is unsupported.
 *
 * References:
 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 *   http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *   http://url.spec.whatwg.org/#urlutils
 *   https://github.com/angular/angular.js/pull/2902
 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @function
 * @param {string} url The URL to be parsed.
 * @description Normalizes and parses a URL.
 * @returns {object} Returns the normalized URL as a dictionary.
 *
 *   | member name   | Description    |
 *   |---------------|----------------|
 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
 *   | protocol      | The protocol including the trailing colon                              |
 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
 *   | search        | The search params, minus the question mark                             |
 *   | hash          | The hash string, minus the hash symbol
 *   | hostname      | The hostname
 *   | port          | The port, without ":"
 *   | pathname      | The pathname, beginning with "/"
 *
 */
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
    var parsed = (angular.isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
    return (parsed.protocol === originUrl.protocol &&
        parsed.host === originUrl.host);
}