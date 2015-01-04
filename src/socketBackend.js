const SAILS_SDK_VERSION = '0.11.0';

export class SocketBackend {

  constructor(io){
    this.io = io;
    this.sockets = {};
  }

  connect(url,options){
    var backend = this;

    if(backend.sockets[url] && backend.sockets[sockets].connected){
      return Promise.resolve(backend.sockets[url]);
    }

    let connectionUrl = url + '?__sails_io_sdk_version=' + SAILS_SDK_VERSION;

    let _rawSocket = backend.io(connectionUrl,options);

    let _sailsSocket = new SailsSocket(_rawSocket);

    backend.sockets[url] = _sailsSocket;

    if(_sailsSocket.connected){
      return Promise.resolve(_sailsSocket)
    }
    let connection = new Promise(function(onConnect,onConnectError){
      _rawSocket.on('connect',function(){
        onConnect(_sailsSocket);
      });
      _rawSocket.on('connect_error',function(err){
        onConnectError(err);
      });
    });

    return connection;
  }

  request(url,options){

  }


}

SocketBackend.$inject = ['$injector']
