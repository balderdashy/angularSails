import {EventEmitter} from 'EventEmitter';

class SailsSocket extends EventEmitter {
  constructor(io,config){
    super();
    this.io = io;
  }
}
