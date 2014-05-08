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
function sailsBackendProvider() {
    this.$get = ['$browser', '$window','$injector', '$q','$timeout', function($browser, $window, $injector, $q,$timeout) {
        return createSailsBackend($browser,$window, $injector, $q,$timeout);
    }];
}

