(function(angular,io){
 var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

function decode(body) {
  var form = new FormData();
  body.trim().split("&").forEach(function (bytes) {
    if (bytes) {
      var split = bytes.split("=");
      var name = split.shift().replace(/\+/g, " ");
      var value = split.join("=").replace(/\+/g, " ");
      form.append(decodeURIComponent(name), decodeURIComponent(value));
    }
  });
  return form;
}

function headers(xhr) {
  var head = new Headers();
  var pairs = xhr.getAllResponseHeaders().trim().split("\n");
  pairs.forEach(function (header) {
    var split = header.trim().split(":");
    var key = split.shift().trim();
    var value = split.join(":").trim();
    head.append(key, value);
  });
  return head;
}

function normalizeMethod(method, downcase) {
  if (downcase) {
    return method.toLowerCase();
  }

  var upcased = method.toUpperCase();
  return methods.indexOf(upcased) > -1 ? upcased : method;
}
function consumed(body) {
  if (body.bodyUsed) {
    return Promise.reject(new TypeError("Already read"));
  }
  body.bodyUsed = true;
}

var Body = function Body() {
  this._body = null;
  this.bodyUsed = false;
};

Body.prototype.arrayBuffer = function () {
  throw new Error("ArrayBuffer not implemented");
};

Body.prototype.blob = function () {
  var rejected = consumed(this);
  return rejected ? rejected : Promise.resolve(new Blob([this._body]));
};

Body.prototype.formData = function () {
  var rejected = consumed(this);
  return rejected ? rejected : Promise.resolve(decode(this._body));
};

Body.prototype.json = function () {
  var rejected = consumed(this);

  if (rejected) {
    return rejected;
  }

  var body = this._body;

  return new Promise(function (resolve, reject) {
    try {
      resolve(JSON.parse(body));
    } catch (ex) {
      reject(ex);
    }
  });
};

Body.prototype.text = function () {
  var rejected = consumed(this);
  return rejected ? rejected : Promise.resolve(this._body);
};
var Headers = function Headers(headers) {
  this.map = {};

  var self = this;

  if (headers instanceof Headers) {
    headers.forEach(function (name, values) {
      values.forEach(function (value) {
        self.append(name, value);
      });
    });
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function (name) {
      self.append(name, headers[name]);
    });
  }
};

Headers.prototype.append = function (name, value) {
  var list = this.map[name];
  if (!list) {
    list = [];
    this.map[name] = list;
  }
  list.push(value);
};

Headers.prototype["delete"] = function (name) {
  delete this.map[name];
};

Headers.prototype.get = function (name) {
  var values = this.map[name];
  return values ? values[0] : null;
};

Headers.prototype.getAll = function (name) {
  return this.map[name] || [];
};

Headers.prototype.has = function (name) {
  return this.map.hasOwnProperty(name);
};

Headers.prototype.set = function (name) {
  return this.map[name] = [value];
};

Headers.prototype.forEach = function (callback) {
  var self = this;
  Object.getOwnPropertyNames(this.map).forEach(function (name) {
    callback(name, self.map[name]);
  });
};
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var Request = (function () {
  var _Body = Body;
  var Request = function Request(url, options) {
    options = options || {};
    this.url = url;
    this._body = options.body;
    this.credentials = options.credentials || null;
    this.headers = new Headers(options.headers);
    this.method = normalizeMethod(options.method || "GET");
    this.mode = options.mode || null;
    this.referrer = null;
  };

  _inherits(Request, _Body);

  return Request;
})();
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var Response = (function () {
  var _Body = Body;
  var Response = function Response(body, options) {
    this._body = body;
    this.type = "default";
    this.url = null;
    this.status = options.status;
    this.statusText = options.statusText;
    this.headers = options.headers;
  };

  _inherits(Response, _Body);

  return Response;
})();
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var HttpRequest = (function () {
  var _Request = Request;
  var HttpRequest = function HttpRequest(url, options) {
    _Request.call(this, url, options);
  };

  _inherits(HttpRequest, _Request);

  HttpRequest.prototype.fetch = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        var status = xhr.status === 1223 ? 204 : xhr.status;

        if (status < 100 || status > 599) {
          reject(new TypeError("Network request failed"));
          return;
        }

        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr)
        };

        resolve(new Response(xhr.responseText, options));
      };

      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };

      xhr.open(self.method, self.url);

      self.headers.forEach(function (name, values) {
        values.forEach(function (value) {
          xhr.setRequestHeader(name, value);
        });
      });

      xhr.send(self._body === undefined ? null : self._body);
    });
  };

  return HttpRequest;
})();
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var SocketRequest = (function () {
  var _Request = Request;
  var SocketRequest = function SocketRequest($q, socket, url, options) {
    _Request.call(this, url, options);
    this._socket = socket;
    this._$q = $q;
  };

  _inherits(SocketRequest, _Request);

  SocketRequest.prototype.fetch = function () {
    var request = this;
    var sendRequest = request._$q(function (resolve, reject) {
      request._socket.emit(normalizeMethod(request.method, true), {
        url: request.url,
        data: request.body,
        headers: request.headers
      }, function (response) {
        var socketResponse = new SocketResponse(response);
        resolve(socketResponse);
      });
    });

    return sendRequest;
  };

  return SocketRequest;
})();
var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var SocketResponse = (function () {
  var _Response = Response;
  var SocketResponse = function SocketResponse(response) {
    this._body = response.body;
    this.type = "socket";
    this.url = null;
    this.status = response.statusCode;
    this.statusText = response.statusCode.toString();
    this.headers = response.headers;
  };

  _inherits(SocketResponse, _Response);

  SocketResponse.prototype.json = function () {
    var response = this;
    return Promise.resolve(response._body);
  };

  return SocketResponse;
})();
var SAILS_SDK_VERSION = "0.11.0";

var SocketBackend = function SocketBackend($q, $window, $sailsConfig) {
  this._$q = $q;
  this._io = $window.io;
  this._socket = undefined;
};

SocketBackend.prototype.connect = function (url, options) {
  return this._connect(url, options);
};

SocketBackend.prototype._connect = function (url, options) {
  var backend = this;

  if (backend._socket) {
    return backend._$q.when(backend._socket);
  }

  url = url || "/";

  var connectionUrl = url + "?__sails_io_sdk_version=" + SAILS_SDK_VERSION;

  var _rawSocket = backend._io(connectionUrl, options);

  if (_rawSocket.connected) {
    return backend._$q.when(_rawSocket);
  }
  var connection = backend._$q(function (onConnect, onConnectError) {
    _rawSocket.on("connect", function () {
      onConnect(_rawSocket);
    });
    _rawSocket.on("connect_error", function (err) {
      onConnectError(err);
    });
  });

  backend._socket = connection;

  return connection;
};

SocketBackend.prototype.fetch = function (url, options) {
  var backend = this;

  var openConnection = backend._socket || backend._connect();

  return openConnection.then(function (socket) {
    return backend._fetch(backend._$q, socket, url, options);
  });
};

SocketBackend.prototype._fetch = function ($q, socket, url, options) {
  var request = new SocketRequest($q, socket, url, options);
  return request.fetch();
};

SocketBackend.$inject = ["$q", "$window", "$sailsConfig"];
var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var NgSails = function NgSails($sailsBackend, $injector) {
  if (!$sailsBackend) {
    throw TypeError("SAILS_BACKEND_NOT_FOUND");
  }

  this._sailsBackend = $sailsBackend;

  if ($injector) {
    this._$injector = $injector;
  }
};

NgSails.prototype.connect = function (url, options) {
  return this._sailsBackend.connect(url, options);
};

NgSails.prototype.disconnect = function (url, options) {
  return this._sailsBackend.disconnect(url, options);
};

NgSails.prototype.fetch = function (url, options) {
  return this._sailsBackend.fetch(url, options).then(function (response) {
    return response.json();
  });
};

NgSails.prototype.get = function (url, options) {
  options = options || {};
  options.method = "GET";
  return this.fetch(url, options);
};

NgSails.prototype.put = function (url, data, options) {
  options = options || {};
  options.method = "PUT";
  options.body = data;
  return this.fetch(url, options);
};

NgSails.prototype.post = function (url, data, options) {
  options = options || {};
  options.method = "POST";
  options.body = data;
  return this.fetch(url, options);
};

NgSails.prototype["delete"] = function (url, options) {
  options = options || {};
  options.method = "DELETE";
  options.body = data;
  return this.fetch(url, options);
};

NgSails.prototype.upload = function (url, data, options) {};

_prototypeProperties(NgSails, {
  $get: {
    get: function () {
      return NgSails;
    },
    enumerable: true
  }
});

NgSails.$inject = ["$sailsBackend", "$injector"];


var ngSails = angular.module("ngSails", []);

ngSails.service("$sailsBackend", SocketBackend);
ngSails.service("$sails", NgSails);
ngSails.constant("$sailsConfig", {
  autoConnect: true
});  
})(angular,window.io)