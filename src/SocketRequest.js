import {Request} from './Request';

export class SocketRequest extends Request {
  constructor($q,socket, url, options){
    super(url,options);
    this._socket = socket;
    this._$q = $q;
  }

  fetch(){
    var request = this;
    var sendRequest = request._$q(function(resolve,reject){
      request._socket.emit(normalizeMethod(request.method,true),{
        url: request.url,
        data: request._body,
        headers: request.headers
      },function(response){
        var socketResponse = new SocketResponse(response);
        resolve(socketResponse);
      });
    });

    return sendRequest;
  }
}
