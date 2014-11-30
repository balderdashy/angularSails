describe("angularSails:: $sailsSocket", function() {

    var $timeout,
    $browser,
    rootScope,
    sailsIOBackend,
    mockIoSocket,
    spy;


    beforeEach(function(){
        //module('ngMocks')
        module('angularSails');
        module('angularSails.mocks');

        inject(function($sailsSocketFactory){

            mockIoSocket = $sailsSocketFactory;
        })

    })

    it('should make requests',inject(function($rootScope,$sailsSocket){

        mockIoSocket.expectEmit('GET',{url: '/foo'}).respond(200,{foo: "bar"})

        var response;

        $sailsSocket.get('/foo').then(function(res){
            response = res.data;
        })


        mockIoSocket.flush();
        $rootScope.$digest()
        expect(response).toEqual({foo: "bar"});

    }))


})
