import {Response} from './SocketResponse';

export class SocketResponse extends Response {
  constructor(response){
    this._body = response.body;
    this.type = 'socket'
    this.url = null
    this.status = response.statusCode
    this.statusText = response.statusCode.toString()
    this.headers = response.headers
  }

  json(){
    var response = this;
    return Promise.resolve(response._body);
  }
}
