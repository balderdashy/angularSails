'use strict'


/**
 * @ngdoc module
 * @name sails
 * @file ngsails.js
 *
 * @description
 *
 * The core sails module for angularJS.
 *
 * This module exposes the $sails(Provider) functionality.
 *
 * The $sails service is a singleton service that encapsulates all sails-related activity.
 *
 * The $sailsProvider allows you to configure most functionality before your app launches in a .config() block.
 *
 *
 *
 */
angular.module('sails', [])

/**
 * @ngdoc service
 * @name $sails
 *
 * @description
 */
    .provider('$sails',function(){

        //sails main configuration manifest.
        var _appManifest = {
            auth : {},
            models : {},
            routes : {},
            connections : {},
            policies : {}
        };

        var _options = {
            globalize : true,
            env : 'dev'
        }




        var Sails = function(){

            var _sails = this;

            _sails.hooks = {};

            return _sails;
        };





       return {
           '$get' : ['$injector',function($injector){



               var sailsProvider = new Sails();

               var loader = $injector.get('$sailsLoader');

               loader.build(sailsProvider,_appManifest);

               if(_options.globalize && _options.env == 'dev'){
                 $injector.get('$window')['$sails'] = sailsProvider;
               }


               return sailsProvider;

           }],
           setManifest : function(loadedManifest){

               angular.extend(_appManifest,loadedManifest);

           },

           connection : function(connection){

               if(angular.isString(connection)){
                   connection = { adapter : connection, identity : connection }
               }

               _appManifest.connections[connection.identity] = connection;
           },

           model : function(){

           }
       }


    })

    .run(['$sails',function($sails){

        console.log($sails)
    }]);

