"use strict";

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
"use strict";

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
"use strict";

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

  Request.prototype.fetch = function () {
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

  Request.prototype.ioFetch = function (socket) {};

  return Request;
})();
"use strict";

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
"use strict";

function Provide(data) {
  this.data = data;
}

this.Provide("$sailsSocket");
var SailsSocket = function SailsSocket(socket, config) {
  this._socket = socket;
  this._config = config;
};

SailsSocket.prototype.fetch = function (url, options) {
  options = options || {};
  var socket = this._socket;
  return new Promise(function (resolve, reject) {
    socket.emit(options.method || "get", {
      url: url,
      data: options.data || options.params || {},
      headers: options.headers || {}
    }, function (response) {
      console.log(response);
      resolve(response);
    });
  });
};

SailsSocket.prototype.get = function (url, options) {
  var socket = this;
  return socket.fetch(url, options).then(function (res) {
    console.log(res);
    return res;
  });
};

exports.SailsSocket = SailsSocket;
"use strict";

var SAILS_SDK_VERSION = "0.11.0";

var SocketBackend = function SocketBackend(io) {
  this.io = io;
  this.sockets = {};
};

SocketBackend.prototype.connect = function (url, options) {
  var backend = this;

  if (backend.sockets[url] && backend.sockets[sockets].connected) {
    return Promise.resolve(backend.sockets[url]);
  }

  var connectionUrl = url + "?__sails_io_sdk_version=" + SAILS_SDK_VERSION;

  var _rawSocket = backend.io(connectionUrl, options);

  var _sailsSocket = new SailsSocket(_rawSocket);

  backend.sockets[url] = _sailsSocket;

  if (_sailsSocket.connected) {
    return Promise.resolve(_sailsSocket);
  }
  var connection = new Promise(function (onConnect, onConnectError) {
    _rawSocket.on("connect", function () {
      onConnect(_sailsSocket);
    });
    _rawSocket.on("connect_error", function (err) {
      onConnectError(err);
    });
  });

  return connection;
};

SocketBackend.prototype.request = function (url, options) {};

exports.SocketBackend = SocketBackend;


SocketBackend.$inject = ["$injector"];
"use strict";

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

function normalizeMethod(method, transport) {
  if (transport && transport == "io") {
    return method.toLowerCase();
  }

  var upcased = method.toUpperCase();
  return methods.indexOf(upcased) > -1 ? upcased : method;
}
"use strict";

var SocketBackend = require("SocketBackend").SocketBackend;


function ngSailsProvider() {
  var _defaultConfig = {};


  return {
    $get: function ($injector) {
      var socketManager = new SocketBackend(window.io);
      return socketManager;
    },
    config: _defaultConfig
  };
}

ngSailsProvider.$inject = ["$injector"];

angular.module("ngSails", ["ng"]).provider("$sails", ngSailsProvider);
