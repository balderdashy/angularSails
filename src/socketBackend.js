const SAILS_SDK_VERSION = '0.11.0';

export class SocketBackend {

  constructor($q,$window,$sailsConfig){
    this._$q = $q;
    this._io = $window.io;
    this._socket = undefined;
  }

  connect(url,options){
    return this._connect(url,options);
  }

  _connect(url,options){
    var backend = this;

    if(backend._socket){
      return backend._$q.when(backend._socket);
    }

    url = url || '/'

    let connectionUrl = url + '?__sails_io_sdk_version=' + SAILS_SDK_VERSION;

    let _rawSocket = backend._io(connectionUrl,options);

    if(_rawSocket.connected){
      return backend._$q.when(_rawSocket);
    }
    let connection = backend._$q(function(onConnect,onConnectError){
      _rawSocket.on('connect',function(){
        onConnect(_rawSocket);
      });
      _rawSocket.on('connect_error',function(err){
        onConnectError(err);
      });
    });

    backend._socket = connection;

    return connection;
  }


  fetch(url,options){

    let backend = this;

    let openConnection = backend._socket || backend._connect();

    return openConnection.then((socket) =>{ return backend._fetch(backend._$q,socket,url,options)})

  }

  _fetch($q,socket,url,options){

    var request = new SocketRequest($q,socket,url,options);
    return request.fetch();
  }


}

SocketBackend.$inject = ['$q','$window','$sailsConfig'];
