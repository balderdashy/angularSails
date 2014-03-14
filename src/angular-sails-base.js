/**
 * The base angular sails module
 * ------------------------------------------------------------------------
 * description.
 */
(function() {

/**
 * The angular sailsBase module.
 * ------------------------------------------------------------------------
 *
 */
var angularSailsBase = angular.module('angularSails.base', ['angularSails.io'])

// Define the `orderByPriority` filter that sorts objects returned by
// $firebase in the order of priority. Priority is defined by Firebase,
// for more info see: https://www.firebase.com/docs/ordered-data.html

/**
 * An angular filte that allows you map collection reourcesto arrays
 * ------------------------------------------------------------------------
 * Right now collections are represented by objects. Doing this allows us to place methods that
 * you can call on the scope variable. A draw back though, is there is no guaranteed order to the
 * items in this collection. Waterline will send back an ordered collection but this doesnt help us
 * when the client ignores the ordering. This filter allows a way to create an array out of the
 * models in the collection and thus, guarantees an order as well as the ability to manipulate and
 * filter the array with other angular filters.
 */
angularSailsBase.filter("collectionToArray", function() {
  return function(input) {
    var collectionArray = [];



    // Map object to array. Right now we check that the model key name is a number. If it is
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
  AngularSails = function ($q, sailsSocket, url, query) {
    this.q = $q;
    this.sailsSocket = sailsSocket;
    this.url = url;
    this.query = query;
    this._resource = {};
    this.collectionCounter = 0;
  }

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
      var data = self.sailsSocket.get(self.url, self.query);
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
     * Gets the inital data from the server. With this inital data we populate an object that
     * represents this angular sails collection.
     *
     * TODO: Think about also populating a seperate resource collection array, just so
     * users have access to raw data response that's recieved.
     */
    _getInitalData: function () {
      var self = this;
      var data = self.sailsSocket.get(self.url, self.query);

      // Assign the values to the object.
      data.then(function (res) {
        if (angular.isArray(res)) {
          angular.forEach(res, function (model) {
            self._assignCid(model);
            self._updateModel(model.cid, model, 'read');
          });
          self._setUpListeners();
        }

        else {

        }

      });

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

      // Key is object.
      if (angular.isObject(key)) {
        modelId = key.id;
      }
      else if (angular.isString(key)) {
        modelId = parseInt(key, 10);
      }
      else if (angular.isNumber(key)) {
        modelId = key;
      }
      else {
        return model;
      }

      model = this._resource[modelId];
      return model;
    },

    /**
     * Update the model. Places model onto the object, making it accessable in the scope.
     * TODO: More docs.
     */
    /**
     * Updates the current model. We create the new key/value pair onto the object or override the
     * current value if the key is already there. Depending on the verb recieved, we handle
     * the updating of the model differently. Right now the only verb that acts different is
     * 'destroyed'.
     *
     * @param  {Number} key  [This key is the unique id of the model]
     * @param  {Object} val  [An object that represents the model]
     * @param  {String} verb [A verb used to determin how to update the model. Possible values
     *                        are 'created', 'read', 'updated', and 'destoryed']
     */
    _updateModel: function (key, val, verb) {
      if (verb !== 'destroyed') {
        this._resource[key] = val;
      } else {
        delete this._resource[key];
      }
    },

    /**
     * Hook up socket message listeners, will allow us to update local models when we recieve
     * certain socket messages.
     */
    _setUpListeners: function () {
      var self = this,
          model = self.url.slice(1);

      self.sailsSocket.on(model, function (obj) {

        var verb = obj.verb,
            data = obj.data || obj.previous;

        self._updateModel(data.id, data, verb);
      });
    },

    /**
     * assigns a collection id to the model. This is so that we have a normalized unique identifier
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
        self.sailsSocket.post(self.url, data).then(function (res) {
          self._assignCid(res);
          self._updateModel(res.cid, res, 'created');
        });
      };

      /**
       * Update resource in collection.
       * TODO: Handle no key being passed. Im thinking this will update entire collection or
       * the individual model its called on.
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      object.$update = function (key) {
        if (angular.isUndefined(key)) {

        }

        var model = self._getModel(key);
        self.sailsSocket.put(self.url + '/' + model.id, model).then(function (res) {
          self._updateModel(res.id, res, 'updated');
        });
      };

      /**
       * Remove resource or optionally remove all resources.
       * TODO: handle no key being passed. Should this delete all records in this collection?
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      object.$remove = function (key) {

        if (angular.isUndefined(key)) {

        }

        var model = self._getModel(key);
        if (model) {
          self.sailsSocket.delete(self.url, model).then(function (res) {
            self._updateModel(res.cid, res, 'destroyed');
          });
        } else {
          self.sailsSocket.delete(self.url);
        }
      };

      angular.extend(self._resource, object);

      angular.forEach(data, function (model) {
        var model = self._constructModel(model);
        self._updateModel(model.cid, model, 'read');
      });
      self._setUpListeners();
    },

    /**
     * onstruct a model. Each resource in a collection will be a model, and will allow users to call methods to update it.
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _constructModel: function (data) {
      var self = this;
          model = data;

      /**
       * Update resource in collection.
       * TODO: Handle no key being passed. Im thinking this will update entire collection or
       * the individual model its called on.
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      model.$update = function () {

        var cid = model.cid;
        self.sailsSocket.put(self.url + '/' + model.id, model).then(function (res) {
          res.cid = cid;
          self._constructModel(res);
          self._updateModel(res.cid, res, 'updated');
        });
      };

      /**
       * Remove resource or optionally remove all resources.
       * TODO: handle no key being passed. Should this delete all records in this collection?
       *
       * @param  {Object|String|Number} key [Key representing model.]
       */
      model.$remove = function () {
        var cid = model.cid;
        self.sailsSocket.delete(self.url, model).then(function (res) {
          self._updateModel(cid, res, 'destroyed');
        });
      };

      // assign a cid to new models.
      if (!model.cid) {
        self._assignCid(model);
      }

      return model;
    }
  }


  // Our angular sails service returns a function that creates an angular sails
  // instance and hooks it up to the resource at the passed in url.
  return function (url, query) {
    var angularSails = new AngularSails($q, sailsSocket, url, query);
    return angularSails.construct();
  }

}]);

})();

