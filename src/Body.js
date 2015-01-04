function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'));
  }
  body.bodyUsed = true;
}

class Body {

  constructor(){
    this._body = null;
    this.bodyUsed = false;
  }

  arrayBuffer(){
    throw new Error('ArrayBuffer not implemented');
  }

  blob(){
    var rejected = consumed(this);
    return rejected ? rejected : Promise.resolve(new Blob([this._body]));
  }

  formData(){
    var rejected = consumed(this);
    return rejected ? rejected : Promise.resolve(decode(this._body));
  }

  json(){
    var rejected = consumed(this);

    if (rejected) {
      return rejected;
    }

    var body = this._body;

    return new Promise(function(resolve, reject) {
      try {
        resolve(JSON.parse(body));
      } catch (ex) {
        reject(ex);
      }
    });
  }

  text() {
    var rejected = consumed(this);
    return rejected ? rejected : Promise.resolve(this._body);
  }
}
