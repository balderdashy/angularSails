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
