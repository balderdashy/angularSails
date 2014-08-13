describe("angularSails:: $sailsConnection", function() {

  var connectionProvider, Employee, callback, $httpBackend;

  beforeEach(module('angularSails.connection'));

  beforeEach(module(function ($sailsConnectionProvider) {
    connectionProvider = $sailsConnectionProvider;
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $sailsConnection = $injector.get('$sailsConnection');
    callback = jasmine.createSpy();
  }));


  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('should start testing...',function(){



      expect('hello').toBeDefined();
  })

  it('should be injectable...',inject(function($sailsConnection){

      expect($sailsConnection).toBeDefined();
  }))

  it('should create new connections',inject(function($sailsConnection){

      var connection = $sailsConnection('testAPI',{

      })

      expect(connection).toBeDefined();
  }))


})
