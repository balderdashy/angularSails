angular
    .module('sails')
    .factory('$sailsConnectionManager',['$injector',function($injector) {

        var _connections = {};
        var _adapters = {};

        function _registerConnection(connection,connectionName){

            var _adapter;

            if(!$injector.has(connection.adapter)){
                throw new Error('Could not find an adapter named: ' + connection.adapter);
            };
            _adapter = $injector.get(connection.adapter);

            _connections[connectionName]= _adapter(connection);



        }


        return {
            registerConnection : _registerConnection,
            connections : _connections

        };

    }]);