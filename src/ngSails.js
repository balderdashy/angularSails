import {SocketBackend} from './SocketBackend';
import {Socket} from './SocketBackend';
import {Headers} from './Headers';
import {Body} from './Body';
import {Request} from './Request';
import {Response} from './Response';

export class NgSails {

  constructor($sailsBackend,$injector){
    if(!$sailsBackend){
      throw TypeError('SAILS_BACKEND_NOT_FOUND');
    }

    this._sailsBackend = $sailsBackend;

    if($injector){
      this._$injector = $injector;
    }

  }

  static get $get(){
    return NgSails;
  }

  connect(url,options){
    return this._sailsBackend.connect(url,options);
  }
  disconnect(url,options){
    return this._sailsBackend.disconnect(url,options);
  }

  fetch(url,options){
    return this._sailsBackend.fetch(url,options).then(function(response){
      return response.json();
    });
  }

  get(url,options){
    options = options || {};
    options.method = 'GET';
    return this.fetch(url,options);
  }

  put(url,data,options){
    options = options || {};
    options.method = 'PUT';
    options.body = data;
    return this.fetch(url,options);
  }

  post(url,data,options){
    options = options || {};
    options.method = 'POST';
    options.body = data;
    return this.fetch(url,options);
  }

  delete(url,options){
    options = options || {};
    options.method = 'DELETE';
    options.body = data;
    return this.fetch(url,options);
  }

  upload(url,data,options){

  }

}

NgSails.$inject = ['$sailsBackend','$injector'];


var ngSails = angular.module('ngSails',[]);

ngSails.service('$sailsBackend',SocketBackend);
ngSails.service('$sails',NgSails);
ngSails.constant('$sailsConfig',{
  autoConnect: true
});

export {ngSails};
