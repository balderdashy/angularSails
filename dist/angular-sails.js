'use strict'


/**
 * @ngdoc module
 * @name sails
 * @file sails.js
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
    .provider('$sails',[function(){

        var NgSailsProvider = function(){
            this.test = 'hello'



            return {
                models : {}
            }
        }

        NgSailsProvider.prototype.foobar = function(){
            console.log('foobar')
        }


       return {
           '$get' : ['$q',NgSailsProvider],
           foo : 'bar'
       }


    }]);

