'use strict';
angular.module('angularSails').provider('$sailsConnection',function sailsBackendProvider() {


        var config =  {
            url: 'http://localhost:1337',
            autoConnect: true,
            ioSocket: undefined

        }

        this.config = config;

        function createSailsBackend($sailsSocketFactory,$browser, $window, $injector, $q, $timeout){

        var tick = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };


        var deferredSocket = $q.defer();

        var socket = config.ioSocket || $sailsSocketFactory();

        if(socket.connected){
            deferredSocket.resolve(socket);
        }
        else{
            socket.on('connect',function(){
                deferredSocket.resolve(socket);
            });
        }




        function openConnection(){
            return deferredSocket.promise;
        }


        function connection(url,options){

        }

        connection._listeners = [];
        connection.connect = function(){
            return openConnection.promise;
        }

        connection.request = function(method, url, post, callback, headers, timeout, withCredentials, responseType){





            function socketResponse(response){
                callback(response.statusCode || 200,response.body || {}, response.headers || {}, response.statusText);
                //status, response, headersString, statusText
            }




            url = url || $browser.url();


            openConnection().then(function(ioSocket){

                ioSocket.emit(method.toLowerCase(),{ url: url, data: fromJson(post) },socketResponse);
            });

        }


        /**
        * Adds a notification listener
        * @param {callback} callback The callback to receive updates from the connection
        * @returns {handle} The callback handle
        */
        connection.addListener = function (eventName,callback) {
            return socket.addListener(eventName,callback);
        };

        /**
        * Removes a notification listener
        * @param {handle} handle The handle for the callback
        */
        connection.removeListener = function (eventName,callback) {
            return socket.removeListener(eventName,callback)
        };


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
