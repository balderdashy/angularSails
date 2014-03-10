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

