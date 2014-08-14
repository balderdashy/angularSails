'use strict';
angular.module('angularSails.backend',[]).provider('$sailsBackend',function sailsBackendProvider() {

    function createSailsBackend($sailsSocketFactory,$browser, $window, $injector, $q, $timeout,$httpBackend){

        var tick = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };


        var socket = $sailsSocketFactory();

        function connection(method, url, post, callback, headers, timeout, withCredentials, responseType){



            function socketResponse(body,jwr){

                callback(jwr.statusCode,body);
                //status, response, headersString, statusText
            }


            url = url || $browser.url();


            socket.emit(method.toLowerCase(),{ url: url, data: fromJson(post) },socketResponse);

        }

        //TODO normalize http paths to event names
        connection.subscribe = function(event,handler){
            console.warn('$sailsSocket.subscribe is deprecated, use .on instead')
            $window.io.socket.on(event,tick($window.io.socket,handler));
        }

        connection.on = function(event,handler){
            $window.io.socket.on(event,tick($window.io.socket,handler));
        }

        return connection;

    }

    /**
    * @ngdoc service
    * @name ngsails.$sailsSocketBackend
    * @requires $window
    * @requires $document
    *
    * @description
    * Service used by the $sailsSocket that delegates to a
    * Socket.io connection (or in theory, any connection type eventually)
    *
    * You should never need to use this service directly, instead use the higher-level abstractions:
    * $sailsSocket or $sailsResource.
    *
    * During testing this implementation is swapped with $sailsMockBackend
    *  which can be trained with responses.
    */

    this.$get = ['$sailsSocketFactory','$browser', '$window','$injector', '$q','$timeout', function($sailsSocketFactory,$browser, $window, $injector, $q,$timeout) {
        return createSailsBackend($sailsSocketFactory,$browser,$window, $injector, $q,$timeout);
    }];
});
