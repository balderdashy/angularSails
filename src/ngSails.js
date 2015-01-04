import {SocketBackend} from "SocketBackend";

function ngSailsProvider(){

  var _defaultConfig = {};


  return {
    '$get'($injector){
      var socketManager = new SocketBackend(window.io);
      return socketManager;
    },
    config: _defaultConfig
  }
}

ngSailsProvider.$inject = ['$injector'];

angular.module('ngSails',['ng']).provider('$sails',ngSailsProvider);
