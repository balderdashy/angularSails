angular.module('ngsails.connection',[])

.factory('SailsConnection',['$http','$injector','$q',function(Http,Injector,Promise){


    //use $http by default...
    var connection = Http;

    //unless $sailsSocket is included
    if(Injector.has('$sailsSocket')){
        connection = Injector.get('$sailsSocket');
    }


    function using(resource, fn) {
        // wraps it in case the resource was not promise
        var pResource = Promise.when(resource);
        return pResource.then(fn).finally(function() {
            return pResource.then(function(resource) {
                return resource.dispose();
            });
        });
    }


    function SailsConnection(provider,options){

    }

    SailsConnection.connect = function(){};

    SailsConnection.authenticate = function(){};

    SailsConnection.disconnect = function(){};

}])
