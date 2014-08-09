describe('sailsResource module', function(){

    var sailsResource;
    beforeEach(function(){

        sailsResource = module('ngsails.resource');

    });

    it('Module should work', function(){

        //expect(sailsResource).toBeDefined();

        inject(function($sailsResource){
            expect($sailsResource).toBeDefined();
        })



    });

    it('allow you to extend a Model constructor', function(){

        inject(function($sailsModel){

            function FooClass(){

            }

            $sailsModel.extend(FooClass);

            expect(FooClass.find()).toBeDefined();

            

        })
    });

    it('allow you to register a Model', function(){

        inject(function($sailsModel){
            expect($sailsModel).toBeDefined();


        })
    });

});


describe('sailsModel', function(){

    var sailsResource;

    beforeEach(function(){

        sailsResource = module('ngsails.resource');

    });


    it('provider should be defined', function(){

        inject(function($sailsModel){
            expect($sailsModel).toBeDefined();
        })
    });



});
