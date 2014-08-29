'use strict';
/*
* //Forked from:
*
* @license
* angular-socket-io v0.6.0
* (c) 2014 Brian Ford http://briantford.com
* License: MIT
*
*
*
*/

angular.module('angularSails')


.provider('$sailsSocketFactory', function () {


    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:';

    // expose to provider
    this.$get = ['$rootScope', '$timeout', '$sailsSDKConfig',function ($rootScope, $timeout,$sailsSDKConfig) {

        var asyncAngularify = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };

        return function socketFactory (options) {
            options = options || {};
            var socket = options.ioSocket || io.connect(options.url || '/',{ query : $sailsSDKConfig.versionString });
            var prefix = options.prefix || defaultPrefix;
            var defaultScope = options.scope || $rootScope;

            var addListener = function (eventName, callback) {
                socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
            };

            var addOnceListener = function (eventName, callback) {
                socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
            };

            var wrappedSocket = {
                on: addListener,
                addListener: addListener,
                once: addOnceListener,



                emit: function (eventName, data, callback) {
                    var lastIndex = arguments.length - 1;
                    callback = arguments[lastIndex];
                    if(typeof callback === 'function') {
                        callback = asyncAngularify(socket, callback);
                        arguments[lastIndex] = callback;
                    }
                    return socket.emit.apply(socket, arguments);
                },


                removeListener: function (ev, fn) {
                    if (fn && fn.__ng) {
                        arguments[1] = fn.__ng;
                    }
                    return socket.removeListener.apply(socket, arguments);
                },

                removeAllListeners: function() {
                    return socket.removeAllListeners.apply(socket, arguments);
                },

                disconnect: function (close) {
                    return socket.disconnect(close);
                },

                // when socket.on('someEvent', fn (data) { ... }),
                // call scope.$broadcast('someEvent', data)
                forward: function (events, scope) {
                    if (events instanceof Array === false) {
                        events = [events];
                    }
                    if (!scope) {
                        scope = defaultScope;
                    }
                    events.forEach(function (eventName) {
                        var prefixedEvent = prefix + eventName;
                        var forwardBroadcast = asyncAngularify(socket, function (data) {
                            scope.$broadcast(prefixedEvent, data);
                        });
                        scope.$on('$destroy', function () {
                            socket.removeListener(eventName, forwardBroadcast);
                        });
                        socket.on(eventName, forwardBroadcast);
                    });
                }
            };

            return wrappedSocket;
        };
    }];
});
