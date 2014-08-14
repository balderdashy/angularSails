(function(){
    var angularSails = angular.module('angularSails',['angularSails.config','angularSails.context','angularSails.connection','angularSails.resource','angularSails.io'],['$provide',function($provide){

        angularSails.$provide = $provide;

    }]).provider('$sails',function NgSailsProvider(){

        function NgSails($sailsResource){
            var sails = this;

            sails.$resource = $sailsResource;

            return sails;
        }

        NgSails.$inject = ['$sailsResource'];
        NgSails.$get = NgSails;

        NgSails.config = {
            models: {}
        }



        //register a model
        NgSails.model = function(identity,modelConfig){

            this.config.models[identity] = modelConfig;

        }
        return NgSails;

    }).run(['$sails',function($sails){

    }]);

    if(typeof io !== 'undefined' && io.sails){
        io.sails.autoConnect = false;
    }


})(window.io);
