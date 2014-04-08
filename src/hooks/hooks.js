angular.module('sails.hooks').provider('$sailsHooks',function(){

    var _hooks = {

    }




    return {

        '$get' : ['$injector',function($injector){

        }],
        registerHook : function(hookName,providerName){

        },
        hooks : _hooks


    }


})