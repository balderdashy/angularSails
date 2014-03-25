'use strict';

/**
 * @ngdoc module
 * @name sails.io
 * @file angularSails.io.js
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
angular.module('angularSails.io', [])


/**
 * @ngdoc constant
 * @name sails.io.$$sailsConnectionMetaData
 *
 * @description
 *
 * //TODO
 *
 */
    .constant('$$sailsConnectionMetaData', {

        version: '__sails_io_sdk_version',
        platform: '__sails_io_sdk_platform',
        language: '__sails_io_sdk_language'

    })

/**
 * @ngdoc constant
 * @name sails.io.$SAILS_SDK_PARAMS
 *
 * @description
 *
 * //TODO
 *
 */
    .constant('$$sailsSDKParams', {

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
    .factory('$$sailsSDKInfo', ['$$sailsConnectionMetaData', '$$sailsSDKParams', function ($$sailsConnectionMetaData, $$sailsSDKParams) {

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
            baseUrl: 'http://localhost:1337'
        };

        var SailsSocketFactory = function ($q, $timeout, SocketIo, $$sailsSDKInfo) {


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


            function _sendRequest(socket, requestCtx) {

                // Since callback is embedded in requestCtx,
                // retrieve it and delete the key before continuing.
                var response = requestCtx.response;
                delete requestCtx.response;

                // Name of socket request listener on the server
                // ( === the request method, e.g. 'get', 'post', 'put', etc. )
                var sailsEndpoint = requestCtx.method;


                socket.emit(sailsEndpoint, requestCtx, tick(socket, function serverResponded(responseCtx) {
                    console.log(responseCtx)

                    var serverResponse = new SailsResponse(requestCtx, responseCtx);

                    if (serverResponse.status >= 400) {
                        response.reject(serverResponse);
                    }
                    else {
                        response.resolve(serverResponse);
                    }
                }));
            }

            /**
             * @ngDoc function
             * @name angularSails.io.SailsSocket
             *
             * @param options
             * @constructor
             */
            var SailsSocket = function (options) {
                var self = this;

                self._requestQueue = []

                self._socketOptions = options || {}

                self._socket = new TmpSocket();

            };

            SailsSocket.prototype.connect = function (url, opts) {

                var connection = $q.defer();

                var self = this;

                opts = opts || {};

                // If explicit connection url is specified, use it
                url = url || self._socketOptions.baseUrl || undefined;

                // Mix the current SDK version into the query string in
                // the connection request to the server:
                if (typeof opts.query !== 'string') opts.query = versionString;
                else opts.query += '&' + versionString;

                var socket = SocketIo.connect(url, opts);

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

                var response = $q.defer()


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

                var self = this;

                // Build a simulated request object.
                var request = {
                    method: options.method,
                    data: options.data,
                    url: options.url,
                    headers: options.headers,
                    response: response
                };

                response.promise.success = function (fn) {
                    response.promise.then(function (response) {
                        console.log(response)
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

                if (self._socket && self.isConnected()) {

                    _sendRequest(self._socket, request);

                }
                else {

                    self._requestQueue.push(request);

                }


                return response.promise;
            };

            SailsSocket.prototype.on = function (eventName, callback) {

                var self = this;

                self._socket.on(eventName, tick(self._socket, callback));

            }


            return function (options) {

                var sailSocket = new SailsSocket(options);

                return sailSocket;

            }

        };

        return {
            '$get': ['$q', '$timeout', 'SocketIo', '$$sailsSDKInfo', SailsSocketFactory ]
        }
    });