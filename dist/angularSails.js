(function() {

  var angularSailsIO = angular.module('angularSails.io', [])


  /**
   * sailsSocketFactory
   *
   * Wraps socket.io to plug it into Angular's digest cycle
   *
   * Code from :
   *
   * - angular-socket-io by Brian Ford : https://github.com/btford/angular-socket-io
   *
   * (c) 2014 Brian Ford http://briantford.com
   * License: MIT
   *
   * sails.io.js by Balderdashy : https://github.com/balderdashy/sails
   */

   angularSailsIO.provider('sailsSocketFactory', function() {
    var defaultPrefix = 'sails:',
      ioSocket;

    // expose to provider
    this.$get = ['$q', '$rootScope', '$timeout', '$window',
      function($q, $rootScope, $timeout, $window) {

        //plugs a socket emit into the ngDigest cycle.
        var asyncAngularify = function(socket, callback) {
          return callback ? function() {
            var args = arguments;
            $timeout(function() {
              callback.apply(socket, args);
            }, 0);
          } : angular.noop;
        };


        //simulates an Sails $http request over a socket.io connection.
        var sailsRequest = function(socket, method, url, data) {

          var sailsDeferredRequest = $q.defer()

          url = url.replace(/^(.+)\/*\s*$/, '$1');
          // If method is undefined, use 'get'
          method = method || 'get';

          if (typeof url !== 'string') {
            sailsDeferredRequest.reject(new Error('Invalid or missing URL!\n' + usage));
          }

          //sails accepts requests formatted as {url : '/api/foos', data: {id : 1}} over websockets
          var requestJson = io.JSON.stringify({
            url: url,
            data: data
          });

          // Send the message over the socket
          socket.emit(method, requestJson, asyncAngularify(socket, function afterEmitted(result) {
            var parsedResult = result;
            if (result && typeof result === 'string') {
              try {
                parsedResult = io.JSON.parse(result);
              } catch (e) {
                if (typeof console !== 'undefined') {
                  console.warn("Could not parse:", result, e);
                }
                return sailsDeferredRequest.reject("Server response could not be parsed!\n" + result);
              }
            }


            if (parsedResult.status == 404) return sailsDeferredRequest.reject(new Error("404: Not found"));
            if (parsedResult.status == 403) return sailsDeferredRequest.reject(new Error("403: Forbidden"));
            if (parsedResult.status == 500) return sailsDeferredRequest.reject(new Error("500: Server Error"));

            else return sailsDeferredRequest.resolve(parsedResult)
          }));
          return sailsDeferredRequest.promise;
        }


        return function sailsSocket(options) {

          options = options || {};

          //allow connection to remote APIs
          var url = $window.location.origin || 'http://localhost:1337'

          //check if options contains a token for JWT.
          if (options.token) {
            var authString = "?token=" + options.token
            url = url + authString
          }

          //connect the socket.
          var socket = options.ioSocket || io.connect(url);

          //prefix for forwarding
          var prefix = options.prefix || defaultPrefix;

          //default scope to apply to
          var defaultScope = options.scope || $rootScope;

          //adds a socket listenter
          var addListener = function(eventName, callback) {
            socket.on(eventName, asyncAngularify(socket, callback));
          };

          //a wrapper around a socket.io connection, to work with the sails API
          var sailsSocket = {

            on: addListener,

            addListener: addListener,

            emit: function(eventName, data, callback) {
              return socket.emit(eventName, data, asyncAngularify(socket, callback));
            },

            removeListener: function() {
              return socket.removeListener.apply(socket, arguments);
            },

            forward: function(events, scope) {
              if (events instanceof Array === false) {
                events = [events]
              }
              if (!scope) {
                scope = defaultScope;
              }
              events.forEach(function(eventName) {
                var prefixedEvent = prefix + eventName;

                var forwardBroadcast = asyncAngularify(socket, function(data) {
                  scope.$broadcast(prefixedEvent, data)
                });

                scope.$on('$destroy', function() {
                  socket.removeListener(eventName, forwardBroadcast)
                });

                socket.on(eventName, forwardBroadcast);
              });
            },
            //sails REST API over socket.io with promises ftw
            get: function(path, query) {
              return sailsRequest(socket, 'get', path, query)
            },
            post: function(path, data) {
              return sailsRequest(socket, 'post', path, data)
            },
            put: function(path, data) {
              return sailsRequest(socket, 'put', path, data)
            },
            delete: function(path, data) {
              return sailsRequest(socket, 'delete', path, data)
            }
          };

          return sailsSocket
        };
      }
    ];
  });

  //decorate $q so we can use success/error
  angularSailsIO.config(['$provide',
    function($provide) {
      $provide.decorator('$q', function($delegate) {
        var defer = $delegate.defer;
        $delegate.defer = function() {
          var deferred = defer();
          deferred.promise.success = function(fn) {
            deferred.promise.then(function(value) {
              fn(value);
            });
            return deferred.promise;
          };
          deferred.promise.error = function(fn) {
            deferred.promise.then(null, function(value) {
              fn(value);
            });
            return deferred.promise;
          };
          return deferred;
        };
        return $delegate;
      })
    }
  ]);


})();

/**
 * The base angular sails module
 * ------------------------------------------------------------------------
 * description.
 */
(function() {

/**
 * The angular sailsBase module will provide firebase-like functionality
 * ------------------------------------------------------------------------
 *
 */
var angularSailsBase = angular.module('angularSails.base', ['angularSails.io'])

/**
 * Angular sails socket service
 * ------------------------------------------------------------------------
 * Socket service that will be used by angular sails service,
 */
angularSailsBase.factory('angularSailsSocket', ['sailsSocketFactory', function (sailsSocket) {
  return sailsSocket();
}]);

/**
 * The angular sailsBase service.
 * ------------------------------------------------------------------------
 *
 */
angularSailsBase.factory('$sails', ['$q', 'angularSailsSocket', function ($q, sailsSocket) {

  // Angular sails constructor.
  // NOTE: note sure we need $q in here.
  AngularSails = function ($q, sailsSocket, url) {
    this.q = $q;
    this.sailsSocket = sailsSocket;
    this.url = url;
  }

  // Angular sails prototype.
  AngularSails.prototype = {

    /**
     * Constuct method creates an object that will be applied to the scope. This will give
     * the scope some methods it can use to perform 3 way data binding operations.
     *
     * @return {Object} [Sails thing]
     */
    construct: function () {
      var self = this,
          object = {};


      /**
       * Add resource to collection
       *
       * @param {Object} data [Data that will be added to resource collection]
       * TODO: support primative types?
       */
      object.$add = function (data) {
        self.sailsSocket.post(self.url, data).then(function (res) {
          self._updateModel(res.id, res);
        });
      };

      /**
       * Update resource
       * @return {[type]} [description]
       */
      object.$update = function () {

      };

      /**
       * Remove resource or optionally remove all resources .
       * @return {[type]} [description]
       *
       * TODO: handle no key being passed. Should this delete all records in this collection?
       */
      object.$remove = function (key) {
        var model = self._getModel(key);
        if (model) {
          self.sailsSocket.delete(self.url, model).then(function (res) {
            self._updateModel(res.id, res);
          });
        } else {
          self.sailsSocket.delete(self.url);
        }
      };

      /**
       * Save resource
       * @return {[type]} [description]
       */
      object.$save = function () {

      };

      self._object = object;
      self._getInitalData();

      return object;
    },

    /**
     * Gets the inital data from the server.
     * @return {[type]} [description]
     */
    _getInitalData: function () {
      var self = this;
      var data = self.sailsSocket.get(self.url);

      // Assign the values to the object.
      data.then(function (res) {
        angular.forEach(res, function (model) {
          self._updateModel(model.id, model);
        });
        self._setUpListeners();
      });

    },

    /**
     * Get the model out of the collection by its key
     *
     * @param  {[type]} key [description]
     *
     * @return {[type]}     [description]
     *
     * * TODO: handle key being string or number.
     */
    _getModel: function (key) {

      // Key is object.
      if (angular.isObject(key)) {
        var model = this._object[key.id];
      }

      // Key is number or string.
      return model;
    },

    /**
     * Update the model. Places model onto the object, making it accessable in the scope.
     * TODO: More docs.
     */
    _updateModel: function (key, val) {
      if (!angular.isUndefined(this._object[key])) {
        delete this._object[key];
      } else {
        this._object[key] = val;
      }
    },

    /**
     * Hook up socket message listeners, will allow us to update the object when we recieve
     * certain socket messages.
     * TODO: More docs.
     */
    _setUpListeners: function () {
      var self = this,
          model = self.url.slice(1);

      self.sailsSocket.on(model, function (obj) {

        var verb = obj.verb,
            data = obj.data,
            previous = obj.previous;

        switch (verb) {

          case 'created':
            self._updateModel(data.id, data);
            break;

          // case 'updated':
          //   break;

          case 'destroyed':
            self._updateModel(previous.id, previous);
            break;
        }

      });
    }
  }


  // Our angular sails service returns a function that creates an angular sails
  // instance and hooks it up to the resource at the passed in url.
  return function (url) {
    var angularSails = new AngularSails($q, sailsSocket, url);
    return angularSails.construct();
  }

}]);


/**
 * Order by id filter
 * ------------------------------------------------------------------------
 * Define the `orderById` filter that sorts objects returned by
 * $sails in the order of priority.
 */
// angularSailsBase.filter("orderById", function() {
//   return function(input) {
//     var sorted = [];

//     if (input) {
//       if (!input.$getIndex || typeof input.$getIndex != "function") {
//         // input is not an angularFire instance
//         if (angular.isArray(input)) {
//           // If input is an array, copy it
//           sorted = input.slice(0);
//         } else if (angular.isObject(input)) {
//           // If input is an object, map it to an array
//           angular.forEach(input, function(prop) {
//             sorted.push(prop);
//           });
//         }
//       } else {
//         // input is an angularFire instance
//         var index = input.$getIndex();
//         if (index.length > 0) {
//           for (var i = 0; i < index.length; i++) {
//             var val = input[index[i]];
//             if (val) {
//               val.$id = index[i];
//               sorted.push(val);
//             }
//           }
//         }
//       }
//     }
//     return sorted;
//   };
// });

})();

