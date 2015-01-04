function Provide(data){
  this.data = data;
}

@Provide('$sailsSocket')
export class SailsSocket {
  constructor(socket,config){
    this._socket = socket;
    this._config = config;
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
        console.log(response);
        resolve(response);
      });
    })
  }

  get(url,options){
    var socket = this;
    return socket.fetch(url,options).then(function(res){
      console.log(res);
      return res;
    });
  }
}
