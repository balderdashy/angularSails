angular
    .module('sails.resource', ['ng'])
    .provider('$sailsResource', function() {


        var _models = {};
        var _connections = {};

        return {
            '$get' : ['SailsBase', 'SailsResourceDefaults', function(Base, Defaults) {



                return function(model,options){

                    var SailsModel = Base.apply(model);

                    return SailsModel;

                }
            }],
            model : function(identity,model,actions){

                _models[identity] = {
                    identity : identity,
                    model : model,
                    actions : actions
                }

            },
            connection : function(connectionName,connection){
                _connections[connectionName] = connection;
            }
        };

    })
    .constant('SailsResourceDefaults',{
        host : 'http://localhost:1337',
        prefix : '',
        pluralize : false
    });