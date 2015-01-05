export class SailsSocket {
  constructor(socketBackend){
    this._socket = socketBackend;
  }

  fetch(url,options){
    options = options || {};
    let socket = this._socket;
    return new Promise(function(resolve,reject){
      socket.emit(options.method || 'get',{
        url: url,
        data: options.data || options.params || {},
        headers: options.headers || {}
      },function(response){
        resolve(response);
      });
    })
  }

  get(url,options){
    var socket = this;
    return socket.fetch(url,options).then(function(res){
      return res;
    });
  }
}
