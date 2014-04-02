angular
    .module('sails.resource', ['ng'])
    .provider('$sailsResource', function() {

        return {
            '$get' : ['SailsBase', 'SailsResourceDefaults', function(Base, Defaults) {



                return function(model,options){

                    var SailsModel = Base.apply(model);

                    return SailsModel;

                }
            }]
        };

    })
    .constant('SailsResourceDefaults',{
        host : 'http://localhost:1337',
        prefix : '',
        pluralize : false
    });