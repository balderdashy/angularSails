describe('angularSails:: $sailsProvider', function(){

    var ngsails;
    beforeEach(function(){

        ngsails = module('angularSails');

    });

    it('should instantiate properly', function(){

        inject(function($sails){
            expect($sails).toBeDefined();

        })
    });

    it('should expose configurations', function(){

        inject(function($sails){

            expect($sails.config).toBeDefined();
        })
    });

    it('should expose model configurations', function(){

        inject(function($sails){

            expect($sails.config.models).toBeDefined();
        })
    });

    it('should provide a $sailsProvider', function(){

        inject(function($sails){
            expect($sails).toBeDefined();

            expect($sails.config.models).toBeDefined();
        })
    });

});

describe('angularSails config check', function(){

    var ngsails;
    beforeEach(function(){

        ngsails = module('angularSails');

    });

    it('should allow $sailsProvider config', function(){

        // module(function($sailsProvider){
        //     $sailsProvider.config.test = 'test';
        //
        //     $sailsProvider.model('Foo',{})
        //
        //
        // });
        //
        // inject(function($sails){
        //     expect($sails.config.models).toBeDefined()
        // });
        //
        // inject(function(Foo){
        //     console.log(Foo)
        //     expect(Foo).toBeDefined();
        // })

    });

});

describe('angularSails.io module', function(){



});
