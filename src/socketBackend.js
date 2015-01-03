class SocketBackend {
  constructor(io){
    this.io = io;
  }

  connect(url,options){
    var socket = this.io(url,options);
    if(socket.connected){
      return Promise.resolve(socket)
    }
    let connection = return new Promise(function(onConnect,onConnectError){
      socket.on('connect',()=> onConnect(socket));
      socket.on('connect_error',(err) => onConnectError(err));
    })

  }


}
