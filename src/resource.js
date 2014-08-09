angular.module('ngsails.resource',[])

.factory('$sailsResource',['$injector','$q','$timeout','$http','$sailsModel',function($injector,$q,$timeout,sailsSocket,http,sailsModel){


    return function(model,controller,config){


        return sailsModel.extend(model);

    }
}]).factory('$sailsModel',[function(){

    function SailsModel(data){

    }

    SailsModel.find = function(where){
        console.log('find!');
        return [];
    }

    SailsModel.findOne = function(criteria){}


    SailsModel.extend = function(ChildModel){
        return angular.extend(ChildModel,SailsModel);
    }

    return SailsModel;


}]) 
