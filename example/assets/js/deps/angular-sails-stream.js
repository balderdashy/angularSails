(function(_){
'use strict';
  angular.module('angularSails.stream', [])

    .factory('$sailsStream', [

      '$q',
      '$rootScope',

      function ($q, $rootScope) {

        return {

          /** raise an event with a given name, returns an array of promises for each listener */
          publish: function(name, args) {

            // there are no listeners
            if (!$rootScope.$$listeners[name]) {
              return [];
            }

            //setup a deferred promise for each listener
            var deferred = [];
            for (var i = 0; i < $rootScope.$$listeners[name].length; i++) {
              deferred.push($q.defer());
            }
            //create a new event args object to pass to the
            // $broadcast containing methods that will allow listeners
            // to return data in an async if required
            var eventArgs = {
              args: args,
              reject: function(a) {
                deferred.pop().reject(a);
              },
              resolve: function(a) {
                deferred.pop().resolve(a);
              }
            };

            //send the event
            $rootScope.$broadcast(name, eventArgs);

            //return an array of promises
            var promises = _.map(deferred, function(p) {
              return p.promise;
            });
            return promises;
          },

          /** subscribe to a method, or use scope.$on = same thing */
          subscribe: function(name, callback) {
            return $rootScope.$on(name, callback);
          },

          /** pass in the result of subscribe to this method, or just call the method returned from subscribe to unsubscribe */
          unsubscribe: function(handle) {
            if (angular.isFunction(handle)) {
              handle();
            }
          }

        };
      }
    ]);
}(window._));


