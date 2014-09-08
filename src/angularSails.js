'use strict';

/**
 * @ngdoc overview
 * @module angularSails
 * @name angularSails
 *
 * @description angularSails v0.10.0
 *
 **/

(function(angular,io){



var $$NgSailsProvide;

angular.module('angularSails',[],function($provide){

    $$NgSailsProvide = $provide;

}).provider('$sails',function NgSailsProvider(){


        function NgSails(Injector){
            
            var sails = this;

           
            return sails;
        }

        NgSails.$inject = ['$injector'];
        NgSails.$get = NgSails;

        NgSails.config = {
            models: {},

        };



        //register a model
        NgSails.model = function(identity,modelConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                var Model = $injector.get('$sailsModel');

                return Model(identity,modelConfig);

            }])

        };

        //register a model
        NgSails.connection = function(identity,connectionConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                return modelConfig;

            }])

        };

        //register a model
        NgSails.route = function(identity,routeConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                return modelConfig;

            }])

        };
        return NgSails;

});


