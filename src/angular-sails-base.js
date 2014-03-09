(function() {

/**
 * The angular sailsBase module will provide firebase-like functionality
 * ------------------------------------------------------------------------
 *
 */
var angularSailsBase = angular.module('angularSails.base',['angularSails.socket'])

/**
 * Angular sails socket service
 * ------------------------------------------------------------------------
 * Socket service that will be used by angular sails service,
 */
angularSails.factory('angularSailsSocket', ['sailsSocketFactory', function (sailsSocket) {
  return sailsSocket();
}]);

/**
 * The angular sailsBase service.
 * ------------------------------------------------------------------------
 *
 */
angularSails.factory('$sailsBase', ['$q', 'angularSailsSocket', function ($q, sailsSocket) {

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

      object.$update = function () {

      };

      object.$remove = function () {

      };

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
     * Update the model. Places model onto the object, making it accessable in the scope.
     * TODO: More docs.
     */
    _updateModel: function (key, val) {
      if (val == null) {
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
            data = obj.data;

        switch (verb) {

          case 'created':
            self._updateModel(data.id, data);
            break;

          // case 'updated':
          //   break;

          // case 'destroyed':
          //   break;
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
