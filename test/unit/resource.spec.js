

describe("angularSails:: $sailsModel", function() {

  var $timeout,
  $browser,
  rootScope,
  sailsIOBackend,
  mockIoSocket,
  spy,
  Employee


  beforeEach(function(){
    //module('ngMocks')
    module('angularSails');
    module('angularSails.mocks');

    inject(function($sailsSocketFactory,$sailsModel,$rootScope){

      mockIoSocket = $sailsSocketFactory;

      Employee = $sailsModel('employee',{})
    })

  })

  afterEach(inject(function($exceptionHandler, $rootScope) {


    $rootScope.$digest();
    mockIoSocket.verifyNoOutstandingExpectation();
    mockIoSocket.verifyNoOutstandingRequest();
  }));

  it('should make requests',function(){

    mockIoSocket.expectEmit('GET',{url: '/employee'}).respond(200,[{id: 1, name: 'Joe'}])

    var response;

    Employee.find().then(function(employees){
      response = employees;
    })


    mockIoSocket.flush();

  })


  it("should build resource that exposes blueprint methods", function() {
    expect(typeof Employee.find).toBe('function');
    expect(typeof Employee.findOne).toBe('function');
    expect(typeof Employee.create).toBe('function');
    expect(typeof Employee.update).toBe('function');
    expect(typeof Employee.destroy).toBe('function');
    expect(typeof Employee.stream).toBe('function');
  });




//
it('should correctly encode url params', function() {


  mockIoSocket.expectEmit('GET', '/employee/foo%231').respond('{}');
  mockIoSocket.expectEmit('GET', '/employee/doh!@foo?bar=baz%231').respond('{}');
  mockIoSocket.expectEmit('GET', '/employee/herp$').respond('{}');

  Employee.findOne({id: 'foo#1'});
  Employee.findOne({id: 'doh!@foo', bar: 'baz#1'});
  Employee.findOne({id: 'herp$'});

  mockIoSocket.flush();
});
//
//
it('should encode array params', function() {
  mockIoSocket.expectEmit('GET', '/employee?bar=baz1&bar=baz2').respond('{}');
  Employee.find({ bar: ['baz1', 'baz2']});

  mockIoSocket.flush();
});
//


describe('Model blueprints',function(){

  describe('Model.find()',function(){

    it('should fetch all records', function() {

      mockIoSocket.expectEmit('GET', '/employee').respond(200,[{id: 1, name: 'joe'},{id: 3, name: 'joey'}]);
      var fetchedEmployees;
      Employee.find().then(function(data){
        fetchedEmployees = data;
      })
      mockIoSocket.flush();
      expect(fetchedEmployees[0].id).toEqual(1);
    });

    it('should do a simple find for records', function() {

      mockIoSocket.expectEmit('GET', '/employee?name=joe').respond(200,[{id: 1, name: 'joe'},{id: 3, name: 'joey'}]);
        //    var Employee = $sailsResource('Employee');
        var fetchedEmployees;
        Employee.find({name: 'joe'}).then(function(data){
          fetchedEmployees = data;
        })
        mockIoSocket.flush();
        expect(fetchedEmployees[0].id).toEqual(1);
      });
  })

  describe('Model.findOne()',function(){

    it('should find one record by primary key', function() {

      mockIoSocket.expectEmit('GET', '/employee/123').respond(200,{id: 123});
        //    var Employee = $sailsResource('Employee');
        var employee;
        Employee.findOne({id: 123}).then(function(data){
          employee = data;
        })
        mockIoSocket.flush();
        expect(employee.id).toEqual(123);
      });


  })

  describe('Model.create()',function(){

    it('should create a new record', function() {

      mockIoSocket.expectEmit('POST', '/employee',{name: 'joe'}).respond(201,{id: 123});
        //    var Employee = $sailsResource('Employee');
        var employee;
        Employee.create({name: 'joe'}).then(function(data){
          employee = data;
        })
        mockIoSocket.flush();
        expect(employee.id).toEqual(123);
      });


  })

  describe('Model.update()',function(){

    it('should update a record', function() {

      mockIoSocket.expectEmit('PUT', '/employee/123',{id: 123, name: 'joe1'}).respond(200,{id: 123, name: 'joe1'});
        //    var Employee = $sailsResource('Employee');
        var employee;
        Employee.update({id: 123, name: 'joe1'}).then(function(data){
          employee = data;
        })
        mockIoSocket.flush();
        expect(employee.id).toEqual(123);
      });


  })

  describe('Model.destroy()',function(){

    it('should delete a record', function() {

      mockIoSocket.expectEmit('DELETE', '/employee/123').respond(200,'{}');
        //    var Employee = $sailsResource('Employee');
        var employee;
        Employee.destroy({id: 123}).then(function(data){

        })
        mockIoSocket.flush();
      });


  })

    //   describe('Instance.save()',function(){

    //       it('save an existing record', function() {

    //         mockIoSocket.expectEmit('GET', '/employee/123').respond(200,{id: 123, name: 'joe'});
    //         mockIoSocket.expectEmit('PUT', '/employee').respond(200,{id: 1, name: 'joe1'});
    //         var employeeInstance;
    //         Employee.findOne({id: 123}).then(function(data){
    //             employeeInstance = data;
    //             //employeeInstance.save();

    //         })

    //         mockIoSocket.flush();

    //       });

    // })


})
})
//
//
// //
// //
// //   it('should support @_property lookups with underscores', function() {
// //     mockIoSocket.expectEmit('GET', '/Order/123').respond({_id: {_key:'123'}, count: 0});
// //     var LineItem = $sailsResource('/Order/:_id', {_id: '@_id._key'});
// //     var item = LineItem.get({_id: 123});
// //     $httpBackend.flush();
// //     expect(item).toEqualData({_id: {_key: '123'}, count: 0});
// //     mockIoSocket.expectEmit('POST', '/Order/123').respond({_id: {_key:'123'}, count: 1});
// //     item.$save();
// //     $httpBackend.flush();
// //     expect(item).toEqualData({_id: {_key: '123'}, count: 1});
// //   });
// //
// //
// //   it('should not pass default params between actions', function() {
// //     var R = $sailsResource('/Path', {}, {get: {method: 'GET', params: {objId: '1'}}, perform: {method: 'GET'}});
// //
// //     mockIoSocket.expectEmit('GET', '/Path?objId=1').respond('{}');
// //     mockIoSocket.expectEmit('GET', '/Path').respond('{}');
// //
// //     R.get({});
// //     R.perform({});
// //   });
// //
// //
// //   it("should build resource with action default param overriding default param", function() {
// //     mockIoSocket.expectEmit('GET', '/Customer/123').respond({id: 'abc'});
// //     var TypeItem = $sailsResource('/:type/:typeId', {type: 'Order'},
// //                                   {get: {method: 'GET', params: {type: 'Customer'}}});
// //     var item = TypeItem.get({typeId: 123});
// //
// //     $httpBackend.flush();
// //     expect(item).toEqualData({id: 'abc'});
// //   });
// //
// //
// //   it('should build resource with action default param reading the value from instance', function() {
// //     mockIoSocket.expectEmit('POST', '/Customer/123').respond();
// //     var R = $sailsResource('/Customer/:id', {}, {post: {method: 'POST', params: {id: '@id'}}});
// //
// //     var inst = new R({id:123});
// //     expect(inst.id).toBe(123);
// //
// //     inst.$post();
// //   });
// //
// //
// //   it('should not throw TypeError on null default params', function() {
// //     mockIoSocket.expectEmit('GET', '/Path').respond('{}');
// //     var R = $sailsResource('/Path', {param: null}, {get: {method: 'GET'}});
// //
// //     expect(function() {
// //       R.get({});
// //     }).not.toThrow();
// //   });
// //
// //
// //   it('should handle multiple params with same name', function() {
// //     var R = $sailsResource('/:id/:id');
// //
// //     $httpBackend.when('GET').respond('{}');
// //     mockIoSocket.expectEmit('GET', '/1/1');
// //
// //     R.get({id:1});
// //   });
// //
// //
// //   it('should throw an exception if a param is called "hasOwnProperty"', function() {
// //     expect(function() {
// //       $sailsResource('/:hasOwnProperty').get();
// //     }).toThrowMinErr('$sailsResource','badname', "hasOwnProperty is not a valid parameter name");
// //   });
// //
// //
// //   it("should create resource", function() {
// //     mockIoSocket.expectEmit('POST', '/Employee', '{"name":"misko"}').respond({id: 123, name: 'misko'});
// //
// //     var cc = Employee.save({name: 'misko'}, callback);
// //     expect(cc).toEqualData({name: 'misko'});
// //     expect(callback).not.toHaveBeenCalled();
// //
// //     $httpBackend.flush();
// //     expect(cc).toEqualData({id: 123, name: 'misko'});
// //     expect(callback).toHaveBeenCalledOnce();
// //     expect(callback.mostRecentCall.args[0]).toEqual(cc);
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //   });
// //
// //
// //   it("should read resource", function() {
// //     mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //     var cc = Employee.get({id: 123}, callback);
// //
// //     expect(cc instanceof Employee).toBeTruthy();
// //     expect(cc).toEqualData({});
// //     expect(callback).not.toHaveBeenCalled();
// //
// //     $httpBackend.flush();
// //     expect(cc).toEqualData({id: 123, number: '9876'});
// //     expect(callback.mostRecentCall.args[0]).toEqual(cc);
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //   });
// //
// //
// //   it('should send correct headers', function() {
// //     mockIoSocket.expectEmitPUT('/Employee/123', undefined, function(headers) {
// //       return headers['If-None-Match'] == "*";
// //     }).respond({id:123});
// //
// //     Employee.conditionalPut({id: {key:123}});
// //   });
// //
// //
// //   it("should read partial resource", function() {
// //     mockIoSocket.expectEmit('GET', '/Employee').respond([{id:{key:123}}]);
// //     var ccs = Employee.query();
// //
// //     $httpBackend.flush();
// //     expect(ccs.length).toEqual(1);
// //
// //     var cc = ccs[0];
// //     expect(cc instanceof Employee).toBe(true);
// //     expect(cc.number).toBeUndefined();
// //
// //     mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: {key: 123}, number: '9876'});
// //     cc.$get(callback);
// //     $httpBackend.flush();
// //     expect(callback.mostRecentCall.args[0]).toEqual(cc);
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //     expect(cc.number).toEqual('9876');
// //   });
// //
// //
// //   it("should update resource", function() {
// //     mockIoSocket.expectEmit('POST', '/Employee/123', '{"id":{"key":123},"name":"misko"}').
// //                  respond({id: {key: 123}, name: 'rama'});
// //
// //     var cc = Employee.save({id: {key: 123}, name: 'misko'}, callback);
// //     expect(cc).toEqualData({id:{key:123}, name:'misko'});
// //     expect(callback).not.toHaveBeenCalled();
// //     $httpBackend.flush();
// //   });
// //
// //
// //   it("should query resource", function() {
// //     mockIoSocket.expectEmit('GET', '/Employee?key=value').respond([{id: 1}, {id: 2}]);
// //
// //     var ccs = Employee.query({key: 'value'}, callback);
// //     expect(ccs).toEqualData([]);
// //     expect(callback).not.toHaveBeenCalled();
// //
// //     $httpBackend.flush();
// //     expect(ccs).toEqualData([{id:1}, {id:2}]);
// //     expect(callback.mostRecentCall.args[0]).toEqual(ccs);
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //   });
// //
// //
// //   it("should have all arguments optional", function() {
// //     mockIoSocket.expectEmit('GET', '/Employee').respond([{id:1}]);
// //
// //     var log = '';
// //     var ccs = Employee.query(function() { log += 'cb;'; });
// //
// //     $httpBackend.flush();
// //     expect(ccs).toEqualData([{id:1}]);
// //     expect(log).toEqual('cb;');
// //   });
// //
// //
// //   it('should delete resource and call callback', function() {
// //     mockIoSocket.expectEmit('DELETE', '/Employee/123').respond({});
// //     Employee.remove({id:123}, callback);
// //     expect(callback).not.toHaveBeenCalled();
// //
// //     $httpBackend.flush();
// //     expect(callback.mostRecentCall.args[0]).toEqualData({});
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //
// //     callback.reset();
// //     mockIoSocket.expectEmit('DELETE', '/Employee/333').respond(204, null);
// //     Employee.remove({id:333}, callback);
// //     expect(callback).not.toHaveBeenCalled();
// //
// //     $httpBackend.flush();
// //     expect(callback.mostRecentCall.args[0]).toEqualData({});
// //     expect(callback.mostRecentCall.args[1]()).toEqual({});
// //   });
// //
// //
// //   it('should post charge verb', function() {
// //     mockIoSocket.expectEmit('POST', '/Employee/123!charge?amount=10', '{"auth":"abc"}').respond({success: 'ok'});
// //     Employee.charge({id:123, amount:10}, {auth:'abc'}, callback);
// //   });
// //
// //
// //   it('should post charge verb on instance', function() {
// //     mockIoSocket.expectEmit('POST', '/Employee/123!charge?amount=10',
// //         '{"id":{"key":123},"name":"misko"}').respond({success: 'ok'});
// //
// //     var card = new Employee({id:{key:123}, name:'misko'});
// //     card.$charge({amount:10}, callback);
// //   });
// //
// //
// //   it("should patch a resource", function() {
// //     mockIoSocket.expectEmitPATCH('/Employee/123', '{"name":"igor"}').
// //                      respond({id: 123, name: 'rama'});
// //
// //     var card = Employee.patch({id: 123}, {name: 'igor'}, callback);
// //
// //     expect(card).toEqualData({name: 'igor'});
// //     expect(callback).not.toHaveBeenCalled();
// //     $httpBackend.flush();
// //     expect(callback).toHaveBeenCalled();
// //     expect(card).toEqualData({id: 123, name: 'rama'});
// //   });
// //
// //
// //   it('should create on save', function() {
// //     mockIoSocket.expectEmit('POST', '/Employee', '{"name":"misko"}').respond({id: 123}, {header1: 'a'});
// //
// //     var cc = new Employee();
// //     expect(cc.$get).toBeDefined();
// //     expect(cc.$query).toBeDefined();
// //     expect(cc.$remove).toBeDefined();
// //     expect(cc.$save).toBeDefined();
// //
// //     cc.name = 'misko';
// //     cc.$save(callback);
// //     expect(cc).toEqualData({name:'misko'});
// //
// //     $httpBackend.flush();
// //     expect(cc).toEqualData({id:123});
// //     expect(callback.mostRecentCall.args[0]).toEqual(cc);
// //     expect(callback.mostRecentCall.args[1]()).toEqual({header1: 'a'});
// //   });
// //
// //
// //   it('should not mutate the resource object if response contains no body', function() {
// //     var data = {id:{key:123}, number:'9876'};
// //     mockIoSocket.expectEmit('GET', '/Employee/123').respond(data);
// //
// //     var cc = Employee.get({id:123});
// //     $httpBackend.flush();
// //     expect(cc instanceof Employee).toBe(true);
// //
// //     mockIoSocket.expectEmit('POST', '/Employee/123', angular.toJson(data)).respond('');
// //     var idBefore = cc.id;
// //
// //     cc.$save();
// //     $httpBackend.flush();
// //     expect(idBefore).toEqual(cc.id);
// //   });
// //
// //
// //   it('should bind default parameters', function() {
// //     mockIoSocket.expectEmit('GET', '/Employee/123.visa?minimum=0.05').respond({id: 123});
// //     var Visa = Employee.bind({verb:'.visa', minimum:0.05});
// //     var visa = Visa.get({id:123});
// //     $httpBackend.flush();
// //     expect(visa).toEqualData({id:123});
// //   });
// //
// //
// //   it('should support dynamic default parameters (global)', function() {
// //     var currentGroup = 'students',
// //         Person = $sailsResource('/Person/:group/:id', { group: function() { return currentGroup; }});
// //
// //
// //     mockIoSocket.expectEmit('GET', '/Person/students/fedor').respond({id: 'fedor', email: 'f@f.com'});
// //
// //     var fedor = Person.get({id: 'fedor'});
// //     $httpBackend.flush();
// //
// //     expect(fedor).toEqualData({id: 'fedor', email: 'f@f.com'});
// //   });
// //
// //
// //   it('should support dynamic default parameters (action specific)', function() {
// //     var currentGroup = 'students',
// //       Person = $sailsResource('/Person/:group/:id', {}, {
// //         fetch: {
// //           method: 'GET',
// //           params: {group: function() { return currentGroup; }}
// //         }
// //       });
// //
// //     mockIoSocket.expectEmit('GET', '/Person/students/fedor').respond({id: 'fedor', email: 'f@f.com'});
// //
// //     var fedor = Person.fetch({id: 'fedor'});
// //     $httpBackend.flush();
// //
// //     expect(fedor).toEqualData({id: 'fedor', email: 'f@f.com'});
// //   });
// //
// //
// //   it('should exercise full stack', function() {
// //     var Person = $sailsResource('/Person/:id');
// //
// //     mockIoSocket.expectEmit('GET', '/Person/123').respond('\n{\n"name":\n"misko"\n}\n');
// //     var person = Person.get({id:123});
// //     $httpBackend.flush();
// //     expect(person.name).toEqual('misko');
// //   });
// //
// //   it('should return a resource instance when calling a class method with a resource instance', function() {
// //     mockIoSocket.expectEmit('GET', '/Person/123').respond('{"name":"misko"}');
// //     var Person = $sailsResource('/Person/:id');
// //     var person = Person.get({id:123});
// //     $httpBackend.flush();
// //     mockIoSocket.expectEmit('POST', '/Person').respond('{"name":"misko2"}');
// //
// //     var person2 = Person.save(person);
// //     $httpBackend.flush();
// //
// //     expect(person2).toEqual(jasmine.any(Person));
// //   });
// //
// //   it('should not include $promise and $resolved when resource is toJson\'ed', function() {
// //     mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //     var cc = Employee.get({id: 123});
// //     $httpBackend.flush();
// //
// //     expect(cc.$promise).toBeDefined();
// //     expect(cc.$resolved).toBe(true);
// //
// //     var json = JSON.parse(angular.toJson(cc));
// //     expect(json.$promise).not.toBeDefined();
// //     expect(json.$resolved).not.toBeDefined();
// //     expect(json).toEqual({id: 123, number: '9876'});
// //   });
// //
// //   describe('promise api', function() {
// //
// //     var $rootScope;
// //
// //
// //     beforeEach(inject(function(_$rootScope_) {
// //       $rootScope = _$rootScope_;
// //     }));
// //
// //
// //     describe('single resource', function() {
// //
// //       it('should add $promise to the result object', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = Employee.get({id: 123});
// //
// //         cc.$promise.then(callback);
// //         expect(callback).not.toHaveBeenCalled();
// //
// //         $httpBackend.flush();
// //
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(callback.mostRecentCall.args[0]).toBe(cc);
// //       });
// //
// //
// //       it('should keep $promise around after resolution', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = Employee.get({id: 123});
// //
// //         cc.$promise.then(callback);
// //         $httpBackend.flush();
// //
// //         callback.reset();
// //
// //         cc.$promise.then(callback);
// //         $rootScope.$apply(); //flush async queue
// //
// //         expect(callback).toHaveBeenCalledOnce();
// //       });
// //
// //
// //       it('should keep the original promise after instance action', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         mockIoSocket.expectEmit('POST', '/Employee/123').respond({id: 123, number: '9876'});
// //
// //         var cc = Employee.get({id: 123});
// //         var originalPromise = cc.$promise;
// //
// //         cc.number = '666';
// //         cc.$save({id: 123});
// //
// //         expect(cc.$promise).toBe(originalPromise);
// //       });
// //
// //
// //       it('should allow promise chaining', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = Employee.get({id: 123});
// //
// //         cc.$promise.then(function(value) { return 'new value'; }).then(callback);
// //         $httpBackend.flush();
// //
// //         expect(callback).toHaveBeenCalledOnceWith('new value');
// //       });
// //
// //
// //       it('should allow $promise error callback registration', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond(404, 'resource not found');
// //         var cc = Employee.get({id: 123});
// //
// //         cc.$promise.then(null, callback);
// //         $httpBackend.flush();
// //
// //         var response = callback.mostRecentCall.args[0];
// //
// //         expect(response.data).toEqual('resource not found');
// //         expect(response.status).toEqual(404);
// //       });
// //
// //
// //       it('should add $resolved boolean field to the result object', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = Employee.get({id: 123});
// //
// //         expect(cc.$resolved).toBe(false);
// //
// //         cc.$promise.then(callback);
// //         expect(cc.$resolved).toBe(false);
// //
// //         $httpBackend.flush();
// //
// //         expect(cc.$resolved).toBe(true);
// //       });
// //
// //
// //       it('should set $resolved field to true when an error occurs', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond(404, 'resource not found');
// //         var cc = Employee.get({id: 123});
// //
// //         cc.$promise.then(null, callback);
// //         $httpBackend.flush();
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(cc.$resolved).toBe(true);
// //       });
// //
// //
// //       it('should keep $resolved true in all subsequent interactions', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = Employee.get({id: 123});
// //         $httpBackend.flush();
// //         expect(cc.$resolved).toBe(true);
// //
// //         mockIoSocket.expectEmit('POST', '/Employee/123').respond();
// //         cc.$save({id: 123});
// //         expect(cc.$resolved).toBe(true);
// //         $httpBackend.flush();
// //         expect(cc.$resolved).toBe(true);
// //       });
// //
// //
// //       it('should return promise from action method calls', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee/123').respond({id: 123, number: '9876'});
// //         var cc = new Employee({name: 'Mojo'});
// //
// //         expect(cc).toEqualData({name: 'Mojo'});
// //
// //         cc.$get({id:123}).then(callback);
// //
// //         $httpBackend.flush();
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(cc).toEqualData({id: 123, number: '9876'});
// //         callback.reset();
// //
// //         mockIoSocket.expectEmit('POST', '/Employee').respond({id: 1, number: '9'});
// //
// //         cc.$save().then(callback);
// //
// //         $httpBackend.flush();
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(cc).toEqualData({id: 1, number: '9'});
// //       });
// //
// //
// //       it('should allow parsing a value from headers', function() {
// //         // https://github.com/angular/angular.js/pull/2607#issuecomment-17759933
// //         mockIoSocket.expectEmit('POST', '/Employee').respond(201, '', {'Location': '/new-id'});
// //
// //         var parseUrlFromHeaders = function(response) {
// //           var resource = response.resource;
// //           resource.url = response.headers('Location');
// //           return resource;
// //         };
// //
// //         var Employee = $sailsResource('/Employee', {}, {
// //           save: {
// //             method: 'post',
// //             interceptor: {response: parseUrlFromHeaders}
// //           }
// //         });
// //
// //         var cc = new Employee({name: 'Me'});
// //
// //         cc.$save();
// //         $httpBackend.flush();
// //
// //         expect(cc.url).toBe('/new-id');
// //       });
// //
// //       it('should pass the same transformed value to success callbacks and to promises', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee').respond(200, { value: 'original' });
// //
// //         var transformResponse = function (response) {
// //           return { value: 'transformed' };
// //         };
// //
// //         var Employee = $sailsResource('/Employee', {}, {
// //           call: {
// //             method: 'get',
// //             interceptor: { response: transformResponse }
// //           }
// //         });
// //
// //         var successValue,
// //             promiseValue;
// //
// //         var cc = new Employee({ name: 'Me' });
// //
// //         var req = cc.$call({}, function (result) {
// //           successValue = result;
// //         });
// //         req.then(function (result) {
// //           promiseValue = result;
// //         });
// //
// //         $httpBackend.flush();
// //         expect(successValue).toEqual({ value: 'transformed' });
// //         expect(promiseValue).toEqual({ value: 'transformed' });
// //         expect(successValue).toBe(promiseValue);
// //       });
// //     });
// //
// //
// //     describe('resource collection', function() {
// //
// //       it('should add $promise to the result object', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond([{id: 1}, {id: 2}]);
// //         var ccs = Employee.query({key: 'value'});
// //
// //         ccs.$promise.then(callback);
// //         expect(callback).not.toHaveBeenCalled();
// //
// //         $httpBackend.flush();
// //
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(callback.mostRecentCall.args[0]).toBe(ccs);
// //       });
// //
// //
// //       it('should keep $promise around after resolution', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond([{id: 1}, {id: 2}]);
// //         var ccs = Employee.query({key: 'value'});
// //
// //         ccs.$promise.then(callback);
// //         $httpBackend.flush();
// //
// //         callback.reset();
// //
// //         ccs.$promise.then(callback);
// //         $rootScope.$apply(); //flush async queue
// //
// //         expect(callback).toHaveBeenCalledOnce();
// //       });
// //
// //
// //       it('should allow promise chaining', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond([{id: 1}, {id: 2}]);
// //         var ccs = Employee.query({key: 'value'});
// //
// //         ccs.$promise.then(function(value) { return 'new value'; }).then(callback);
// //         $httpBackend.flush();
// //
// //         expect(callback).toHaveBeenCalledOnceWith('new value');
// //       });
// //
// //
// //       it('should allow $promise error callback registration', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond(404, 'resource not found');
// //         var ccs = Employee.query({key: 'value'});
// //
// //         ccs.$promise.then(null, callback);
// //         $httpBackend.flush();
// //
// //         var response = callback.mostRecentCall.args[0];
// //
// //         expect(response.data).toEqual('resource not found');
// //         expect(response.status).toEqual(404);
// //       });
// //
// //
// //       it('should add $resolved boolean field to the result object', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond([{id: 1}, {id: 2}]);
// //         var ccs = Employee.query({key: 'value'}, callback);
// //
// //         expect(ccs.$resolved).toBe(false);
// //
// //         ccs.$promise.then(callback);
// //         expect(ccs.$resolved).toBe(false);
// //
// //         $httpBackend.flush();
// //
// //         expect(ccs.$resolved).toBe(true);
// //       });
// //
// //
// //       it('should set $resolved field to true when an error occurs', function() {
// //         mockIoSocket.expectEmit('GET', '/Employee?key=value').respond(404, 'resource not found');
// //         var ccs = Employee.query({key: 'value'});
// //
// //         ccs.$promise.then(null, callback);
// //         $httpBackend.flush();
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(ccs.$resolved).toBe(true);
// //       });
// //     });
// //
// //     it('should allow per action response interceptor that gets full response', function() {
// //       Employee = $sailsResource('/Employee', {}, {
// //         query: {
// //           method: 'get',
// //           isArray: true,
// //           interceptor: {
// //             response: function(response) {
// //               return response;
// //             }
// //           }
// //         }
// //       });
// //
// //       mockIoSocket.expectEmit('GET', '/Employee').respond([{id: 1}]);
// //
// //       var ccs = Employee.query();
// //
// //       ccs.$promise.then(callback);
// //
// //       $httpBackend.flush();
// //       expect(callback).toHaveBeenCalledOnce();
// //
// //       var response = callback.mostRecentCall.args[0];
// //       expect(response.resource).toBe(ccs);
// //       expect(response.status).toBe(200);
// //       expect(response.config).toBeDefined();
// //     });
// //
// //
// //     it('should allow per action responseError interceptor that gets full response', function() {
// //       Employee = $sailsResource('/Employee', {}, {
// //         query: {
// //           method: 'get',
// //           isArray: true,
// //           interceptor: {
// //             responseError: function(response) {
// //               return response;
// //             }
// //           }
// //         }
// //       });
// //
// //       mockIoSocket.expectEmit('GET', '/Employee').respond(404);
// //
// //       var ccs = Employee.query();
// //
// //       ccs.$promise.then(callback);
// //
// //       $httpBackend.flush();
// //       expect(callback).toHaveBeenCalledOnce();
// //
// //       var response = callback.mostRecentCall.args[0];
// //       expect(response.status).toBe(404);
// //       expect(response.config).toBeDefined();
// //     });
// //   });
// //
// //
// //   describe('failure mode', function() {
// //     var ERROR_CODE = 500,
// //         ERROR_RESPONSE = 'Server Error',
// //         errorCB;
// //
// //     beforeEach(function() {
// //       errorCB = jasmine.createSpy('error').andCallFake(function(response) {
// //         expect(response.data).toBe(ERROR_RESPONSE);
// //         expect(response.status).toBe(ERROR_CODE);
// //       });
// //     });
// //
// //
// //     it('should call the error callback if provided on non 2xx response', function() {
// //       mockIoSocket.expectEmit('GET', '/Employee/123').respond(ERROR_CODE, ERROR_RESPONSE);
// //
// //       Employee.get({id:123}, callback, errorCB);
// //       $httpBackend.flush();
// //       expect(errorCB).toHaveBeenCalledOnce();
// //       expect(callback).not.toHaveBeenCalled();
// //     });
// //
// //
// //     it('should call the error callback if provided on non 2xx response (without data)', function() {
// //       mockIoSocket.expectEmit('GET', '/Employee').respond(ERROR_CODE, ERROR_RESPONSE);
// //
// //       Employee.get(callback, errorCB);
// //       $httpBackend.flush();
// //       expect(errorCB).toHaveBeenCalledOnce();
// //       expect(callback).not.toHaveBeenCalled();
// //     });
// //   });
// //
// //   it('should transform request/response', function() {
// //     var Person = $sailsResource('/Person/:id', {}, {
// //       save: {
// //         method: 'POST',
// //         params: {id: '@id'},
// //         transformRequest: function(data) {
// //           return angular.toJson({ __id: data.id });
// //         },
// //         transformResponse: function(data) {
// //           return { id: data.__id };
// //         }
// //       }
// //     });
// //
// //     mockIoSocket.expectEmit('POST', '/Person/123', { __id: 123 }).respond({ __id: 456 });
// //     var person = new Person({id:123});
// //     person.$save();
// //     $httpBackend.flush();
// //     expect(person.id).toEqual(456);
// //   });
// //
// //   describe('suffix parameter', function() {
// //
// //     describe('query', function() {
// //       it('should add a suffix', function() {
// //         mockIoSocket.expectEmit('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
// //         var UserService = $sailsResource('/users/:id.json', {id: '@id'});
// //         var user = UserService.query();
// //         $httpBackend.flush();
// //         expect(user).toEqualData([{id: 1, name: 'user1'}]);
// //       });
// //
// //       it('should not require it if not provided', function(){
// //         mockIoSocket.expectEmit('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
// //         var UserService = $sailsResource('/users.json');
// //         var user = UserService.query();
// //         $httpBackend.flush();
// //         expect(user).toEqualData([{id: 1, name: 'user1'}]);
// //       });
// //
// //       it('should work when query parameters are supplied', function() {
// //         mockIoSocket.expectEmit('GET', '/users.json?red=blue').respond([{id: 1, name: 'user1'}]);
// //         var UserService = $sailsResource('/users/:user_id.json', {user_id: '@id'});
// //         var user = UserService.query({red: 'blue'});
// //         $httpBackend.flush();
// //         expect(user).toEqualData([{id: 1, name: 'user1'}]);
// //       });
// //
// //       it('should work when query parameters are supplied and the format is a resource parameter', function() {
// //         mockIoSocket.expectEmit('GET', '/users.json?red=blue').respond([{id: 1, name: 'user1'}]);
// //         var UserService = $sailsResource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
// //         var user = UserService.query({red: 'blue'});
// //         $httpBackend.flush();
// //         expect(user).toEqualData([{id: 1, name: 'user1'}]);
// //       });
// //
// //       it('should work with the action is overriden', function(){
// //         mockIoSocket.expectEmit('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
// //         var UserService = $sailsResource('/users/:user_id', {user_id: '@id'}, {
// //           query: {
// //             method: 'GET',
// //             url: '/users/:user_id.json',
// //             isArray: true
// //           }
// //         });
// //         var user = UserService.query();
// //         $httpBackend.flush();
// //         expect(user).toEqualData([ {id: 1, name: 'user1'} ]);
// //       });
// //
// //       it('should not convert string literals in array into Resource objects', function() {
// //         mockIoSocket.expectEmit('GET', '/names.json').respond(["mary", "jane"]);
// //         var strings = $sailsResource('/names.json').query();
// //         $httpBackend.flush();
// //         expect(strings).toEqualData(["mary", "jane"]);
// //       });
// //
// //       it('should not convert number literals in array into Resource objects', function() {
// //         mockIoSocket.expectEmit('GET', '/names.json').respond([213, 456]);
// //         var numbers = $sailsResource('/names.json').query();
// //         $httpBackend.flush();
// //         expect(numbers).toEqualData([213, 456]);
// //       });
// //
// //       it('should not convert boolean literals in array into Resource objects', function() {
// //         mockIoSocket.expectEmit('GET', '/names.json').respond([true, false]);
// //         var bools = $sailsResource('/names.json').query();
// //         $httpBackend.flush();
// //         expect(bools).toEqualData([true, false]);
// //       });
// //     });
// //
// //     describe('get', function(){
// //       it('should add them to the id', function() {
// //         mockIoSocket.expectEmit('GET', '/users/1.json').respond({id: 1, name: 'user1'});
// //         var UserService = $sailsResource('/users/:user_id.json', {user_id: '@id'});
// //         var user = UserService.get({user_id: 1});
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 1, name: 'user1'});
// //       });
// //
// //       it('should work when an id and query parameters are supplied', function() {
// //         mockIoSocket.expectEmit('GET', '/users/1.json?red=blue').respond({id: 1, name: 'user1'});
// //         var UserService = $sailsResource('/users/:user_id.json', {user_id: '@id'});
// //         var user = UserService.get({user_id: 1, red: 'blue'});
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 1, name: 'user1'});
// //       });
// //
// //       it('should work when the format is a parameter', function() {
// //         mockIoSocket.expectEmit('GET', '/users/1.json?red=blue').respond({id: 1, name: 'user1'});
// //         var UserService = $sailsResource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
// //         var user = UserService.get({user_id: 1, red: 'blue'});
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 1, name: 'user1'});
// //       });
// //
// //       it('should work with the action is overriden', function(){
// //         mockIoSocket.expectEmit('GET', '/users/1.json').respond({id: 1, name: 'user1'});
// //         var UserService = $sailsResource('/users/:user_id', {user_id: '@id'}, {
// //           get: {
// //             method: 'GET',
// //             url: '/users/:user_id.json'
// //           }
// //         });
// //         var user = UserService.get({user_id: 1});
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 1, name: 'user1'});
// //       });
// //     });
// //
// //     describe("save", function() {
// //       it('should append the suffix', function() {
// //         mockIoSocket.expectEmit('POST', '/users.json', '{"name":"user1"}').respond({id: 123, name: 'user1'});
// //         var UserService = $sailsResource('/users/:user_id.json', {user_id: '@id'});
// //         var user = UserService.save({name: 'user1'}, callback);
// //         expect(user).toEqualData({name: 'user1'});
// //         expect(callback).not.toHaveBeenCalled();
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 123, name: 'user1'});
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(callback.mostRecentCall.args[0]).toEqual(user);
// //         expect(callback.mostRecentCall.args[1]()).toEqual({});
// //       });
// //
// //       it('should append when an id is supplied', function() {
// //         mockIoSocket.expectEmit('POST', '/users/123.json', '{"id":123,"name":"newName"}').respond({id: 123, name: 'newName'});
// //         var UserService = $sailsResource('/users/:user_id.json', {user_id: '@id'});
// //         var user = UserService.save({id: 123, name: 'newName'}, callback);
// //         expect(callback).not.toHaveBeenCalled();
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 123, name: 'newName'});
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(callback.mostRecentCall.args[0]).toEqual(user);
// //         expect(callback.mostRecentCall.args[1]()).toEqual({});
// //       });
// //
// //       it('should append when an id is supplied and the format is a parameter', function() {
// //         mockIoSocket.expectEmit('POST', '/users/123.json', '{"id":123,"name":"newName"}').respond({id: 123, name: 'newName'});
// //         var UserService = $sailsResource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
// //         var user = UserService.save({id: 123, name: 'newName'}, callback);
// //         expect(callback).not.toHaveBeenCalled();
// //         $httpBackend.flush();
// //         expect(user).toEqualData({id: 123, name: 'newName'});
// //         expect(callback).toHaveBeenCalledOnce();
// //         expect(callback.mostRecentCall.args[0]).toEqual(user);
// //         expect(callback.mostRecentCall.args[1]()).toEqual({});
// //       });
// //     });
// //
// //     describe('escaping /. with /\\.', function() {
// //       it('should work with query()', function() {
// //         mockIoSocket.expectEmit('GET', '/users/.json').respond();
// //         $sailsResource('/users/\\.json').query();
// //       });
// //       it('should work with get()', function() {
// //         mockIoSocket.expectEmit('GET', '/users/.json').respond();
// //         $sailsResource('/users/\\.json').get();
// //       });
// //       it('should work with save()', function() {
// //         mockIoSocket.expectEmit('POST', '/users/.json').respond();
// //         $sailsResource('/users/\\.json').save({});
// //       });
// //     });
// //   });
// //
// //   describe('action-level url override', function() {
// //
// //     it('should support overriding url template with static url', function() {
// //       mockIoSocket.expectEmit('GET', '/override-url?type=Customer&typeId=123').respond({id: 'abc'});
// //       var TypeItem = $sailsResource('/:type/:typeId', {type: 'Order'}, {
// //         get: {
// //           method: 'GET',
// //           params: {type: 'Customer'},
// //           url: '/override-url'
// //         }
// //       });
// //       var item = TypeItem.get({typeId: 123});
// //       $httpBackend.flush();
// //       expect(item).toEqualData({id: 'abc'});
// //     });
// //
// //
// //     it('should support overriding url template with a new template ending in param', function() {
// //       //    url parameter in action, parameter ending the string
// //       mockIoSocket.expectEmit('GET', '/Customer/123').respond({id: 'abc'});
// //       var TypeItem = $sailsResource('/foo/:type', {type: 'Order'}, {
// //         get: {
// //           method: 'GET',
// //           params: {type: 'Customer'},
// //           url: '/:type/:typeId'
// //         }
// //       });
// //       var item = TypeItem.get({typeId: 123});
// //       $httpBackend.flush();
// //       expect(item).toEqualData({id: 'abc'});
// //
// //       //    url parameter in action, parameter not ending the string
// //       mockIoSocket.expectEmit('GET', '/Customer/123/pay').respond({id: 'abc'});
// //       TypeItem = $sailsResource('/foo/:type', {type: 'Order'}, {
// //         get: {
// //           method: 'GET',
// //           params: {type: 'Customer'},
// //           url: '/:type/:typeId/pay'
// //         }
// //       });
// //       item = TypeItem.get({typeId: 123});
// //       $httpBackend.flush();
// //       expect(item).toEqualData({id: 'abc'});
// //     });
// //
// //
// //     it('should support overriding url template with a new template ending in string', function() {
// //       mockIoSocket.expectEmit('GET', '/Customer/123/pay').respond({id: 'abc'});
// //       var TypeItem = $sailsResource('/foo/:type', {type: 'Order'}, {
// //         get: {
// //           method: 'GET',
// //           params: {type: 'Customer'},
// //           url: '/:type/:typeId/pay'
// //         }
// //       });
// //       var item = TypeItem.get({typeId: 123});
// //       $httpBackend.flush();
// //       expect(item).toEqualData({id: 'abc'});
// //     });
// //   });
// // });
// //
// // describe('resource', function() {
// //   var $httpBackend, $sailsResource;
// //
// //   beforeEach(module(function($exceptionHandlerProvider) {
// //     $exceptionHandlerProvider.mode('log');
// //   }));
// //
// //   beforeEach(module('angularSails.resource'));
// //
// //   beforeEach(inject(function($injector) {
// //     $httpBackend = $injector.get('$httpBackend');
// //     $sailsResource = $injector.get('$sailsResource');
// //   }));
// //
// //
// //   it('should fail if action expects an object but response is an array', function() {
// //     var successSpy = jasmine.createSpy('successSpy');
// //     var failureSpy = jasmine.createSpy('failureSpy');
// //
// //     mockIoSocket.expectEmit('GET', '/Customer/123').respond({id: 'abc'});
// //
// //     $sailsResource('/Customer/123').query()
// //       .$promise.then(successSpy, function(e) { failureSpy(e.message); });
// //     $httpBackend.flush();
// //
// //     expect(successSpy).not.toHaveBeenCalled();
// //     expect(failureSpy).toHaveBeenCalled();
// //     expect(failureSpy.mostRecentCall.args[0]).toMatch(
// //         /^\[\$sailsResource:badcfg\] Error in resource configuration\. Expected response to contain an array but got an object/
// //       );
// //   });
// //
// //   it('should fail if action expects an array but response is an object', function() {
// //     var successSpy = jasmine.createSpy('successSpy');
// //     var failureSpy = jasmine.createSpy('failureSpy');
// //
// //     mockIoSocket.expectEmit('GET', '/Customer/123').respond([1,2,3]);
// //
// //     $sailsResource('/Customer/123').get()
// //       .$promise.then(successSpy, function(e) { failureSpy(e.message); });
// //     $httpBackend.flush();
// //
// //     expect(successSpy).not.toHaveBeenCalled();
// //     expect(failureSpy).toHaveBeenCalled();
// //     expect(failureSpy.mostRecentCall.args[0]).toMatch(
// //         /^\[\$sailsResource:badcfg\] Error in resource configuration. Expected response to contain an object but got an array/
// //       );
// //   });
// describe('utils',function(){
//
//     describe('isValidDottedPath', function() {
//       /* global isValidDottedPath: false */
//       it('should support arbitrary dotted names', function() {
//         expect(isValidDottedPath('')).toBe(false);
//         expect(isValidDottedPath('1')).toBe(false);
//         expect(isValidDottedPath('1abc')).toBe(false);
//         expect(isValidDottedPath('.')).toBe(false);
//         expect(isValidDottedPath('$')).toBe(true);
//         expect(isValidDottedPath('a')).toBe(true);
//         expect(isValidDottedPath('A')).toBe(true);
//         expect(isValidDottedPath('a1')).toBe(true);
//         expect(isValidDottedPath('$a')).toBe(true);
//         expect(isValidDottedPath('$1')).toBe(true);
//         expect(isValidDottedPath('$$')).toBe(true);
//         expect(isValidDottedPath('$.$')).toBe(true);
//         expect(isValidDottedPath('.$')).toBe(false);
//         expect(isValidDottedPath('$.')).toBe(false);
//       });
//     });
//
//     describe('lookupDottedPath', function() {
//       /* global lookupDottedPath: false */
//       var data = {a: {b: 'foo', c: null}};
//
//       it('should get dotted paths', function() {
//         expect(lookupDottedPath(data, 'a')).toEqual({b: 'foo', c: null});
//         expect(lookupDottedPath(data, 'a.b')).toBe('foo');
//         expect(lookupDottedPath(data, 'a.c')).toBeNull();
//       });
//
//       it('should skip over null/undefined members', function() {
//         expect(lookupDottedPath(data, 'a.b.c')).toBe(undefined);
//         expect(lookupDottedPath(data, 'a.c.c')).toBe(undefined);
//         expect(lookupDottedPath(data, 'a.b.c.d')).toBe(undefined);
//         expect(lookupDottedPath(data, 'NOT_EXIST')).toBe(undefined);
//       });
//     });
//
//     describe('shallow copy', function() {
//       /* global shallowClearAndCopy */
//       it('should make a copy', function() {
//         var original = {key:{}};
//         var copy = shallowClearAndCopy(original);
//         expect(copy).toEqual(original);
//         expect(copy.key).toBe(original.key);
//       });
//
//
//       it('should omit "$$"-prefixed properties', function() {
//         var original = {$$some: true, $$: true};
//         var clone = {};
//
//         expect(shallowClearAndCopy(original, clone)).toBe(clone);
//         expect(clone.$$some).toBeUndefined();
//         expect(clone.$$).toBeUndefined();
//       });
//
//
//       it('should copy "$"-prefixed properties from copy', function() {
//         var original = {$some: true};
//         var clone = {};
//
//         expect(shallowClearAndCopy(original, clone)).toBe(clone);
//         expect(clone.$some).toBe(original.$some);
//       });
//
//
//       it('should omit properties from prototype chain', function() {
//         var original, clone = {};
//         function Func() {}
//         Func.prototype.hello = "world";
//
//         original = new Func();
//         original.goodbye = "world";
//
//         expect(shallowClearAndCopy(original, clone)).toBe(clone);
//         expect(clone.hello).toBeUndefined();
//         expect(clone.goodbye).toBe("world");
//       });
//     });
//
//
// })
// });
