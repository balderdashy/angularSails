console.log('loaded loader')
angular.module('sails').provider('$sailsHookLoader',function(){


    //modular config. these can be overridden by:
    // - replacing with an alternate implementation
    var sailsHooks = {


    }

    return {
        '$get' : ['$injector',function($injector){


            var connectionManager = $injector.get('$sailsConnectionManager');

            function _loadSails(sailsInstance,manifest){

                angular.forEach(manifest.connections,connectionManager.registerConnection);

                sailsInstance.connections = connectionManager.connections;
                sailsInstance.models = _loadModels(sailsInstance,manifest.models);

            }

            function _loadModels(models){

                var _models = {};

                return _models;

            }



            return {

                build :_loadSails

            }
        }]
    }


})