angular.module('sailsModelDemoApp',['angularSails.io','angularSails.model'])

    .config(['$sailsResourceProvider',function($sailsResourceProvider){

        //register a simple model with the provider
        $sailsResourceProvider.model('User',{
            attributes: {
                name: 'string',
                age: 'string'
            }
        })
    }])


    .controller('DemoRootController',['$sailsResource',function($sailsResource){

        console.log($sailsResource)


    }])