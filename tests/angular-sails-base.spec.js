(function(){

  'use strict';

  describe('Module angularSails.base', function () {

    it('should be registered', function() {
      var module = angular.module('angularSails.base');
      expect(module).not.toBeNull();
    });


    beforeEach(module('angularSails.base'));

    describe('$sailsRef service api', function () {

      // Mock socket service.
      beforeEach(module(function ($provide) {
        $provide.factory('angularSailsSocket', ['$q', function ($q) {
          var collectionData = [{id:1}, {id: 2}, {id: 3}];
          var deferred = $q.defer();
          return {
            get: function() {
              deferred.resolve(collectionData);
              return deferred.promise;
            },
            post: function() {
              collectionData = [{id:1}, {id: 2}, {id: 3}, {id: 4}];
              deferred.resolve(collectionData);
              return deferred.promise;
            },
            put: function(path, data) {
              deferred.resolve(data);
              return deferred.promise;
            },
            delete: function() {
              return deferred.promise;
            },
            on: function () {}
          };
        }]);
      }));

      var $sailsRef, $rootScope, collection;
      beforeEach(inject(function (_$sailsRef_, _$rootScope_) {
        $sailsRef = _$sailsRef_;
        $rootScope = _$rootScope_;
        collection = $sailsRef('/comment');
        $rootScope.$apply();
      }));

      it('should create a collection object from a resource', function () {
        expect(angular.isObject(collection)).toBe(true);
        expect(collection.$add).toBeDefined();
        expect(collection.$update).toBeDefined();
        expect(collection.$remove).toBeDefined();
        expect(collection.$save).toBeDefined();
      });

      it('should contain models that are model objects', function () {
        var model = collection['1'];
        expect(angular.isObject(model)).toBe(true);
        expect(model.$update).toBeDefined();
        expect(model.$remove).toBeDefined();
      });

      it('should add a model to the collection when using $add', function () {
        collection.$add({id: 4});
        $rootScope.$apply();
        var newModel = collection['4'];
        expect(newModel).toBeDefined();
        expect(angular.isObject(newModel)).toBe(true);
        expect(newModel.$update).toBeDefined();
        expect(newModel.$remove).toBeDefined();
      });

      it('should update the model in the collection when using $update', function () {
        var collection = $sailsRef('/comment');
        $rootScope.$apply();
        var modelToUpdate = collection['1'];
        modelToUpdate.name = 'Greg';
        collection.$update(modelToUpdate);
        $rootScope.$apply();
        expect(collection['1'].name).toEqual('Greg');
      });

    });


    describe('angular sails filter', function () {

      var filter, data, result;
      beforeEach(inject(function ($filter) {
        filter = $filter('collectionToArray');

        data = {
          '1': {id: 1},
          '4': {id: 10},
          '3': {id: 5},
          '2': {id: 8}
        };

        result = filter(data);
      }));

      it('should map an object to an array of objects', function () {
        expect(angular.isArray(result)).toBe(true);
        expect(angular.isObject(result[0])).toBe(true);
      });

      it('should be mutable by other angular filters', inject( function ($filter) {
        var orderByResult = $filter('orderBy')(result, 'id');
        expect(orderByResult).toEqual([
          {id: 1},
          {id: 5},
          {id: 8},
          {id: 10}
        ]);
      }));

    });

  });

}());
