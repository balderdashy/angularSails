angular
    .module('sails.resource')
    .provider('SailsDeferred', function() {
        this.$get = ['$q', function($q) {
            // function deferred(instance, error)
            //
            // @param {instance} - An instance to wrap in a deferred object
            // @param {error}    - Error to return
            //
            // Returns an object or error wrapped in a deferred. Responds to then() method. Shortcut
            // for establishing these boilerplate lines.
            return function deferred(instance, error) {
                var deferred = $q.defer();
                if (error) deferred.reject(error);
                else deferred.resolve(instance);
                return deferred.promise;
            };
        }];
    });