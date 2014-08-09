describe('angularSails build check', function(){

    var ngsails;
    beforeEach(function(){

        ngsails = module('angularSails');

    });

    it('should provide a $sailsProvider', function(){

        inject(function($sails){
            expect($sails).toBeDefined();

            expect($sails.foo).toBeDefined();
        })
    });

    it('should provide sailsConfig provider', function(){

        inject(function($sailsConfig){
            expect($sailsConfig).toBeDefined();
        })
    });

});

describe('angularSails.io module', function(){

    var ngsails;
    beforeEach(function(){

        ngsails = module('angularSails.io');

    });

    it('should provide a sailsSocket', function(){

        inject(function($sailsSocket){
            expect($sailsSocket).toBeDefined();


            //expect($sailsSocket.foo).toBeDefined();
        })



    });



});
