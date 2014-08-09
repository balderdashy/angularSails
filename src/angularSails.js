angular.module('angularSails',['angularSails.io']).provider('$sails',function NgSailsProvider(){

    var sailsProvider = this;
    sailsProvider.$inject = ['$http'];
    sailsProvider.$get = NgSails;

    function NgSails($http,$sailsSocket){
        return {
            foo: '$http'
        }
    }


}).provider('$sailsConfig',function(){

    this.config = {};



    this.$get = function(){
        return this.config;
    }


})

if(typeof io !== 'undefined' && io.sails){
    io.sails.autoConnect = false;
    console.log(io.sails)
}
