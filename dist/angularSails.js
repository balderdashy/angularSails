(function() {

'use strict';

var collection = angular.module('sailsBaseCollection', []);

/**
 * Utility methods for collections
 * ------------------------------------------------------------------------
 * These are a group of underscore methods that are very helpful when working
 * with collection. Thank you so much, underscore. You are the best. I would have used
 * you as a dependecy but didnt need all those other utilities.
 *
 * ******************************************************************
 * Massive props to all those who helped contribute to the project.
 * http://underscorejs.org/
 * https://github.com/jashkenas/underscore
 * ******************************************************************
 */
collection.factory('collectionUtils', function () {

  var _ = {};

  var ArrayProto = Array.prototype;

  var breaker = {},
      nativeForEach = ArrayProto.forEach,
      nativeKeys = Object.keys,
      nativeSome = ArrayProto.some;

  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true;
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    };
  };

  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  _.each = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length1 = obj.length; i < length1; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var j = 0, length2 = keys.length; j < length2; j++) {
        if (iterator.call(context, obj[keys[j]], keys[j], obj) === breaker) return;
      }
    }
    return obj;
  };

  _.identity = function(value) {
    return value;
  };

  _.any = function(obj, predicate, context) {
    if (!predicate) {
      predicate = _.identity;
    }

    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    _.each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  _.find = function(obj, predicate, context) {
    var result;
    _.any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // -- public api --
  return {
    findWhere: _.findWhere
  };

});

})();

'use strict'

/**
 * @ngdoc module
 * @name sails.io
 * @file angularSails.io.js
 *
 * @description
 *
 * This file allows you to send and receive socket.io messages to & from Sails
 * by simulating a REST client interface on top of socket.io.
 *
 * It models its API after the $http pattern from Angular and returns $q promises.
 *
 * So if you're switching from using AJAX to sockets, instead of:
 *  `$http.post( url, [data]).then( successHandler, errorHandler )`
 *
 * You would use:
 *    `socket.post( url, [data]).then( successHandler, errorHandler )`
 *
 * It also supports $http-style success / error callbacks:
 *  ` socket.get( url, [params] )
 *      .success(function(results){})
 *      .error(function(results){}) `
 *
 *
 * For more information, visit:
 * http://github.com/balderdashy/angularSails
 */
angular.module('angularSails.io', [])


/**
 * @ngdoc constant
 * @name sails.io.$SAILS_CONNECTION_METADATA_PARAMS
 *
 * @description
 *
 * //TODO
 *
 */
    .constant('$SAILS_CONNECTION_METADATA_PARAMS', {

        version: '__sails_io_sdk_version',
        platform: '__sails_io_sdk_platform',
        language: '__sails_io_sdk_language'

    })

/**
 * @ngdoc constant
 * @name sails.io.$SAILS_SDK_PARAMS
 *
 * @description
 *
 * //TODO
 *
 */
    .constant('$SAILS_SDK_PARAMS', {

        version: '0.10.0',  // TODO: pull this automatically from package.json during build.
        platform: typeof module === 'undefined' ? 'browser' : 'node',
        language: 'javascript',
        flavor: 'angular'

    })

/**
 * @ngdoc factory
 * @name sails.io.$SAILS_SDK_INFO
 *
 * @description
 *
 * //TODO
 *
 */
    .factory('$SAILS_SDK_INFO', ['$SAILS_CONNECTION_METADATA_PARAMS', '$SAILS_SDK_PARAMS', function ($SAILS_CONNECTION_METADATA_PARAMS, $SAILS_SDK_PARAMS) {

        console.log($SAILS_CONNECTION_METADATA_PARAMS)
        function _getVersionString() {

            var versionString = $SAILS_CONNECTION_METADATA_PARAMS.version + '='
                + $SAILS_SDK_PARAMS.version + '&' + $SAILS_CONNECTION_METADATA_PARAMS.platform + '='
                + $SAILS_SDK_PARAMS.platform + '&' + $SAILS_CONNECTION_METADATA_PARAMS.language + '='
                + $SAILS_SDK_PARAMS.language;

            return versionString;
        }

        return {
            getVersionString: _getVersionString
        }

    }])

    .factory('SocketIo', ['$window', function ($window) {
        if (!$window.io) {
            throw new Error('Socket IO Not Found!')
        }
        return $window.io;

    }])


/**
 * @ngdoc provider
 * @name sails.io.$sailsSocket
 *
 * @description
 *
 * This provider returns a service that allows you to create a connection to a Sails server via socket.io.
 *
 *
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

    .provider('$sailsSocket', function () {

        var _socketDefaults = {
            autoConnect: true,
            environment: 'development',
            baseUrl: 'http://localhost:1337'
        };

        var SailsSocketFactory = function ($q, $timeout, SocketIo, $SAILS_SDK_INFO) {


            var versionString = $SAILS_SDK_INFO.getVersionString();

            var tick = function (socket, callback) {
                return callback ? function () {
                    var args = arguments;
                    $timeout(function () {
                        callback.apply(socket, args);
                    }, 0);
                } : angular.noop;
            };

            /**
             * TmpSocket
             *
             * A mock Socket used for binding events before the real thing
             * has been instantiated (since we need to use io.connect() to
             * instantiate the real thing, which would kick off the connection
             * process w/ the server, and we don't necessarily have the valid
             * configuration to know WHICH SERVER to talk to yet.)
             *
             * @api private
             * @constructor
             */

            function TmpSocket() {
                var boundEvents = {};

                this.socket = {connected: false}

                this.on = function (evName, fn) {
                    boundEvents[evName] = fn;
                    return this;
                };
                this.become = function (actualSocket) {
                    for (var eventName in boundEvents) {
                        actualSocket.on(eventName, boundEvents[eventName]);

                        // boundEvents[eventName] = angular.noop;
                    }
                    return actualSocket;
                };
            }


            /**
             * @ngDoc function
             * @name angularSails.io.SailsResponse
             *
             * @description
             *
             * Transforms a raw sails response into a $http-like responseObject
             *
             * @param socket
             * @constructor
             */

            function SailsResponse(requestContext, responseCtx) {


                this.data = responseCtx.body || {};
                this.headers = responseCtx.headers || {};
                this.status = responseCtx.statusCode || responseCtx.body.status || 200;
                this.config = requestContext;
            }

            SailsResponse.prototype.toString = function () {
                return '[ResponseFromSails]' + '  -- ' +
                    'Status: ' + this.statusCode + '  -- ' +
                    'Headers: ' + this.headers + '  -- ' +
                    'Body: ' + this.body;
            };
            SailsResponse.prototype.toPOJO = function () {
                return {
                    data: this.body,
                    headers: this.headers,
                    status: this.statusCode,
                    config: this.config
                };
            };


            function _sendRequest(socket, requestCtx) {

                // Since callback is embedded in requestCtx,
                // retrieve it and delete the key before continuing.
                var response = requestCtx.response;
                delete requestCtx.response;

                // Name of socket request listener on the server
                // ( === the request method, e.g. 'get', 'post', 'put', etc. )
                var sailsEndpoint = requestCtx.method;


                socket.emit(sailsEndpoint, requestCtx, tick(socket, function serverResponded(responseCtx) {


                    var serverResponse = new SailsResponse(requestCtx, responseCtx);

                    if (serverResponse.status >= 400) {
                        response.reject(serverResponse);
                    }
                    else {
                        response.resolve(serverResponse);
                    }
                }));
            }

            /**
             * @ngDoc function
             * @name angularSails.io.SailsSocket
             *
             * @param options
             * @constructor
             */
            var SailsSocket = function (options) {
                var self = this;

                self._requestQueue = [];

                self._socketOptions = options || {};

                self._socket = new TmpSocket();

            };

            SailsSocket.prototype.connect = function (url, opts) {

                var connection = $q.defer();

                var self = this;

                opts = opts || {};

                // If explicit connection url is specified, use it
                url = url || self._socketOptions.baseUrl || undefined;

                // Mix the current SDK version into the query string in
                // the connection request to the server:
                if (typeof opts.query !== 'string') opts.query = versionString;
                else opts.query += '&' + versionString;

                var socket = SocketIo.connect(url, opts);

                self._socket = self._socket.become(socket);

                self._socket.on('connect', function () {

                    angular.forEach(self._requestQueue, function (queuedRequest) {
                        _sendRequest(self._socket, queuedRequest);
                    })
                })

                self._socket.once('connect', connection.resolve);
                self._socket.on('connecting', connection.notify);
                self._socket.once('connect_failed', connection.reject);

                return connection.promise;

            };

            SailsSocket.prototype.isConnected = function () {

                return this._socket.socket.connected;

            };

            SailsSocket.prototype.get = function (url, data) {


                return this._request({
                    method: 'get',
                    url: url,
                    data: data
                });
            };

            SailsSocket.prototype.post = function (url, data) {

                return this._request({
                    method: 'post',
                    url: url,
                    data: data
                });
            };
            SailsSocket.prototype.post = function (url, data) {

                return this._request({
                    method: 'post',
                    url: url,
                    data: data
                });
            };
            SailsSocket.prototype['delete'] = function (url, data) {

                return this._request({
                    method: 'delete',
                    url: url,
                    data: data
                });
            };

            SailsSocket.prototype._request = function (options) {

                var response = $q.defer()


                var usage = 'Usage:\n socket.' +
                    (options.method || 'request') +
                    '( destinationURL, [dataToSend] )';

                options = options || {};
                options.data = options.data || {};
                options.headers = options.headers || {};

                // Remove trailing slashes and spaces to make packets smaller.
                options.url = options.url.replace(/^(.+)\/*\s*$/, '$1');
                if (typeof options.url !== 'string') {
                    throw new Error('Invalid or missing URL!\n' + usage);
                }

                var self = this;

                // Build a simulated request object.
                var request = {
                    method: options.method,
                    data: options.data,
                    url: options.url,
                    headers: options.headers,
                    response: response
                };

                response.promise.success = function (fn) {
                    response.promise.then(function (response) {
                        fn(response.data, response.statusCode, response.headers, request);
                    });
                    return response.promise;
                };

                response.promise.error = function (fn) {
                    response.promise.then(null, function (response) {
                        fn(response.data, response.statusCode, response.headers, request);
                    });
                    return response.promise;
                };

                if (self._socket && self.isConnected()) {

                    _sendRequest(_self._socket, request);

                }
                else {

                    self._requestQueue.push(request);

                }


                return response.promise;
            };

            SailsSocket.prototype.on = function (eventName, callback) {

                var self = this;

                self._socket.on(eventName, tick(self._socket, callback));

            }


            return function (options) {

                var sailSocket = new SailsSocket(options);

                return sailSocket;

            }

        };

        return {
            '$get': ['$q', '$timeout', 'SocketIo', '$SAILS_SDK_INFO', SailsSocketFactory ]
        }
    });
/**
 * The base angular sails module
 * ------------------------------------------------------------------------
 * description.
 */
(function() {
  'use strict';

/**
 * The angular sailsBase module.
 * ------------------------------------------------------------------------
 *
 */
var angularSailsBase = angular.module('angularSails.base', ['angularSails.io', 'sailsBaseCollection']);

// Define the `orderByPriority` filter that sorts objects returned by
// $firebase in the order of priority. Priority is defined by Firebase,
// for more info see: https://www.firebase.com/docs/ordered-data.html

/**
 * An angular filter that allows you map collection reourcesto arrays
 * ------------------------------------------------------------------------
 * Right now collections are represented by objects. Doing this allows us to place methods that
 * you can call on the scope variable. A draw back though, is there is no guaranteed order to the
 * items in this collection. Waterline will send back an ordered collection but this doesnt help us
 * when the client ignores the ordering. This filter allows a way to create an array out of the
 * models in the collection and thus, guarantees an order as well as the ability to manipulate and
 * filter the array with other angular filters.
 */
angularSailsBase.filter('collectionToArray', function() {
  return function(input) {
    var collectionArray = [];

    // Map object to array. Right now we check that the model key name is a number. If it is,
    // we know that the key value pair represents a model in the collection.
    // There is probably a better way to do this like adding cid prefix to value names.
    // TODO: come back and think of a more elegant way to do this.
    angular.forEach(input, function(val, key) {
      if (!isNaN(key)) {
        collectionArray.push(val);
      }
    });
    return collectionArray;
  };
});

/**
 * Angular sails socket service
 * ------------------------------------------------------------------------
 * Socket service that will be used by angular sails service,
 */
angularSailsBase.factory('angularSailsSocket',
  ['sailsSocketFactory', function (sailsSocketFactory) {
  return sailsSocketFactory();
}]);

/**
 * The angular sailsBase service.
 * ------------------------------------------------------------------------
 *
 */
angularSailsBase.factory('$sailsRef',
  ['angularSailsSocket', 'collectionUtils', function (angularSailsSocket, collectionUtils) {

  // Angular sails constructor.
  var AngularSails = function (angularSailsSocket, collectionUtils, url, query) {
    this.angularSailsSocket = angularSailsSocket;
    this.collectionUtils = collectionUtils;
    this.url = url;
    this.query = query;
    this._resource = {};
    this.collectionCounter = 0;
    this._reourceId = this.url.slice(1);  // identifier of what resource we are using.
    this.socketModelCid = undefined;
  };

  // Angular sails prototype.
  AngularSails.prototype = {

    /**
     * Constuct method creates an object that will be applied to the scope. This will give
     * the scope some methods it can use to perform 3 way data binding operations.
     *
     * @return {Object} [Angular Sails object that represents a resource and offers methods to
     *                   manipulate data at the specified url]
     */
    construct: function () {
      var self = this;

      // Get initial data and construct collection or model.
      var data = self.angularSailsSocket.get(self.url, self.query);
      data.then(function (res) {
        if (angular.isArray(res)) {
          self._constructCollection(res);
        } else {
          self._constructModel(res);
        }
      });

      return self._resource;
    },


    /**
     * Get the model out of the collection by its key
     *
     * @param  {Object|String|Number} key [Key can be multiple arguments. The first being an
     *                                     object that represents the model. The most important
     *                                     thing about this obect is that it contains the unique
     *                                     id. Users can also pass back a string of the unique id
     *                                     or simply a number of the id.]
     *
     * @return {Object}     [the object in this collection.]
     */
    _getModel: function (key) {

      var modelId,
          model = {};

      // Key is object. handles models object and criteria objects being passed.
      if (angular.isObject(key)) {
        if (key.hasOwnProperty('cid')) {
          modelId = key.cid;
        }

        // This need to change to use something like underscore's _.findWhere method. Right now it
        // just assumes the user passed a criteria with key 'id'.
        else {
          modelId = key.id;
        }
      }

      // Key is string, and user knows the id of the model they want to use. Ignore cids
      else if (angular.isString(key)) {
        modelId = parseInt(key, 10);
      }

      // Key is number, and user knows the id of the model they want to use. Ignore cids
      else if (angular.isNumber(key)) {
        modelId = key;
      }

      // Not sure this is relevent anymore.
      else {
        throw new Error('Must pass a model object, criteria object, string id, or number id');
      }

      // We only want to return attributes and not the entire model object.
      model = this._resource[modelId];
      return model;
    },

    /**
     * Get the attributes of the model object. We are only concerned with key names that don't
     * start with the '$' character.
     * TODO: Handle case if someone puts an attribute name with $ as its first character.
     *
     * @param  {[type]} model [description]
     *
     * @return {[type]}       [description]
     */
    _getAttributes: function (model) {
      var attributes = {};
      angular.forEach(model, function (val, key) {
        if (key.charAt(0) !== '$' && key !== 'cid') {
          attributes[key] = val;
        }
      });
      return attributes;
    },

    /**
     * Updates the current model. We create the new key/value pair onto the object or override the
     * current value if the key is already there. Depending on the verb recieved, we handle
     * the updating of the model differently. Right now the only verb that acts different is
     * 'destroyed'.
     *
     * @param  {Object} val         [An object that represents the model.]
     * @param  {String} verb        [A verb used to determin how to update the model. Possible
     *                               values are 'created', 'read', 'updated', and 'destoryed'.]
     * @param  {Boolean} fromSocket  [Boolean so we know if update is from socket message.]
     */
    _updateModel: function (data, verb, fromSocket) {
      var model;

      // Create a new model on creates and reads
      if (verb === 'read' || verb === 'created') {
        data.$collection =  this._resource;
        model = this._constructModel(data);
      }

      // Just pass down the model on updates and destroys.
      else if (verb === 'updated' || verb === 'destroyed') {

        // If from a socket message,
        if (fromSocket) {
          // TODO: find a better way of doing this. Should not be using createdAt to search
          // for resource in collection. This should work better when we allow users to pass
          // in primary key attribute names.
          var oldModel = collectionUtils.findWhere(this._resource, {createdAt: data.createdAt});
          model = angular.extend(oldModel, data);
        } else {
          model = data;
        }
      }


      // eplace or add value at unique cid key for everything but destroys.
      if (verb !== 'destroyed') {
        this._resource[model.cid] = model;
      } else {
        delete this._resource[model.cid];
      }
    },

    /**
     * Set up collection listeners. Collection listen for different things other then models.

     */
    _setCollectionListeners: function () {
      var self = this,
          model = self.url.slice(1);

      self.angularSailsSocket.on(model, function (obj) {

        var verb = obj.verb,
            data = obj.data || obj.previous,
            fromSocket = true;

        self._updateModel(data, verb, fromSocket);
      });
    },

    _setModelListeners: function () {

    },

    /**
     * Assigns a collection id to the model. This is so that we have a normalized unique identifier
     * on each model in the collection
     * @return {[type]} [description]
     */
    _assignCid: function (model) {
      model.cid = ++this.collectionCounter;
    },

    /**
     * constructs a collection.
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _constructCollection: function (data) {
      var self = this,
          object = {};

      /**
       * Add resource to collection
       * TODO: support primative types and arrays? Not sure this will work well. Sails
       * is more resource based.
       *
       * @param {Object} data [Data that will be added to resource collection]
       */
      object.$add = function (data) {
        self.angularSailsSocket.post(self.url, data).then(function (res) {
          self._updateModel(res, 'created');
        });
      };

      /**
       * Update resource in collection.
       * TODO: Update multiple reources in collection at once.
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      object.$update = function (key) {
        var model = self._getModel(key),
            attrs = self._getAttributes(model);

        self.angularSailsSocket.put(self.url + '/' + attrs.id, attrs).then(function (res) {
          var updatedModel = angular.extend(res, model);
          self.socketModelCid = model.cid;
          self._updateModel(updatedModel, 'updated');
        });
      };

      /**
       * Persist all local changes in collection.
       * @return {[type]} [description]
       */
      object.$save = function () {

      };

      /**
       * Remove resource or optionally remove all resources.
       * TODO: handle no key being passed. Should this delete all records in this collection?
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      object.$remove = function (key) {
        var model = self._getModel(key),
            attrs = self._getAttributes(model);

        self.angularSailsSocket.delete(self.url, attrs).then(function () {
          self.socketModelCid = model.cid;
          self._updateModel(model, 'destroyed');
        });
      };

      angular.extend(self._resource, object);

      // Make a model for each item in the collection. We want to give each model a reference to
      // its parent collection.
      angular.forEach(data, function (model) {
        self._updateModel(model, 'read');
      });

      self._setCollectionListeners();
    },

    /**
     * construct a model. Each resource in a collection will be a model, and will allow users
     * to call methods to update it.
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _constructModel: function (data) {
      var self = this,
          model = data;

      /**
       * Update resource in collection.
       * TODO: Handle no key being passed. Im thinking this will update entire collection or
       * the individual model its called on.
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      model.$update = model.$save = function () {

        if (hasCollection()) {
          model.$collection.$update(model);
        }

        else {
          var attrs = self._getAttributes(model);
          self.angularSailsSocket.put(self.url, attrs).then(function () {

          });
        }
      };

      /**
       * Remove resource or optionally remove all resources.
       * TODO: handle no key being passed. Should this delete all records in this collection?
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      model.$remove = function () {

        if (hasCollection()) {
          model.$collection.$remove(model);
        }

        else {
          var attrs = self._getAttributes(model);
          self.angularSailsSocket.delete(self.url, attrs).then(function () {

          });
        }
      };

      // Simple method to see if model has a collection.
      function hasCollection () {
        return model.$collection;
      }

      if (!hasCollection()) {
        angular.extend(self._resource, model);
      } else {
        // assign a cid to new models.
        if (!model.cid) {
          self._assignCid(model);
        }
        return model;
      }


    }
  };


  // Our angular sails service returns a function that creates an angular sails
  // instance and hooks it up to the resource at the passed in url.
  return function (url, query) {
    var angularSails = new AngularSails(angularSailsSocket, collectionUtils, url, query);
    return angularSails.construct();
  };

}]);

})();

