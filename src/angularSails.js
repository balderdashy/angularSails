'use strict';

/**
 * @ngdoc overview
 * @module angularSails
 * @name angularSails
 *
 * @description angularSails v0.10.0
 *
 **/
angular.module('angularSails',['angularSails.config','angularSails.connection','angularSails.resource','angularSails.io','angularSails.backend']).provider('$sails',function NgSailsProvider(){

        function NgSails($sailsResource){
            var sails = this;

            sails.$resource = $sailsResource;

            return sails;
        }

        NgSails.$inject = ['$sailsResource'];
        NgSails.$get = NgSails;

        NgSails.config = {
            models: {},

        };



        //register a model
        NgSails.model = function(identity,modelConfig){

            this.config.models[identity] = modelConfig;

        };
        return NgSails;

});
