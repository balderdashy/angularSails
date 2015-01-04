class Headers {

  constructor(headers){
    this.map = {};

    var self = this;

    if(headers instanceof Headers){
      headers.forEach(function(name, values){
        values.forEach(function(value){
          self.append(name,value);
        });
      });
    }
    else if(headers){
      Object.getOwnPropertyNames(headers).forEach(function(name){
        self.append(name, headers[name]);
      });
    }
  }

  append(name,value){
    var list = this.map[name];
    if(!list){
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  }

  delete(name){
    delete this.map[name];
  }

  get(name){
    let values = this.map[name];
    return values ? values[0] : null;
  }

  getAll(name){
    return this.map[name] || [];
  }

  has(name){
    return this.map.hasOwnProperty(name);
  }

  set(name){
    return this.map[name] = [value];
  }

  forEach(callback){
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name]);
    });
  }
}
