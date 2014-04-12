//
///**
// * @ngdoc module
// * @name ngsails.resource
// * @description
// *
// * # sailsResource
// *
// * The `ngsails.resource` module brings the Sails / Waterline model API to Angular.
// *
// *
// * <div doc-module-components="sailsResource"></div>
// *
// *
// */


SailsResourceProvider.$inject = ['$injector'];
function SailsResourceProvider($injector) {




    function resourceFactory($injector){



        var Model = $injector.get('$sailsModel');



        return function(model,controller,options){

            var Resource = function(data){

               this.data = data;
                "use strict";
            }


            Resource.inherits(Model);

            Resource.identity = model;

           // var resource = new SailsResource(model);

            //Model.inherits(resource);



            return Resource
        }

    }


    this.config = {
        models : {},
        controllers : {}
    }

    this.$get = ['$injector',resourceFactory];


};

angular.module('sails.resource',[])
    .provider('$sailsModel',SailsModelProvider)
    .provider('$sailsCache',SailsObjectCacheProvider)
    .provider('$sailsResource',SailsResourceProvider);