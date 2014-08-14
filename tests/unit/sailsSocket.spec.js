describe("angularSails:: $sailsSocket", function() {

    var $timeout,
    $browser,
    $sailsBackend,
    mockIoSocket,
    spy;

    beforeEach(module('ngMock'));
    beforeEach(module('angularSails'));

    beforeEach(module('angularSailsMocks'));

    beforeEach(inject(function($injector) {

        $sailsBackend = $injector.get('$sailsBackend');

        callback = jasmine.createSpy();
    }));

    it('should make requests',inject(function($sailsSocket){

        $sailsBackend.expectGET('/foo').respond({foo: "bar"});

        var response;

        $sailsSocket.get('/foo').then(function(res){
            response = res.data;
        })

        $sailsBackend.flush();

        expect(response).toEqual({foo: "bar"});

    }))


})
