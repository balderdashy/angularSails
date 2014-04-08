angular.module('sails').provider('$sailsConnection',[function(){

    var SailsConnectionProvider = function(){}

    SailsConnectionProvider.$get = function($http){};
    SailsConnectionProvider.$inject = ['$http'];

    return SailsConnectionProvider;
}]);