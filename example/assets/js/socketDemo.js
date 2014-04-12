angular.module('sailsDemoApp',['sails.io','sails.resource'])

.config(function(){
        "use strict";
        console.log()
    })
    .factory('Comment',['$sailsResource',function(resource){
        "use strict";


        var CommentModel =  resource('foo');
        var TestModel =  resource('test');


       var model = CommentModel.new('data')

        var model2 = new CommentModel('data')
        console.log(model)
        console.log(model2)
        return CommentModel;



    }])


.run(function($sailsSocket,$rootScope,Comment){


        console.log(Comment.find())
        window.sailsSocket = $sailsSocket;
        $sailsSocket.get('/comment').success(function(comments){
            $rootScope.comments = comments;
        });

        $sailsSocket.get('/comment/1',{params : {id : 1}}).success(function(comments){
            console.log(comments)
        });
        $sailsSocket.get('/comment',{params : {id : 2}}).success(function(comments){
            console.log(comments)
        });

        $sailsSocket.post('/comment',{body : 'test'}).success(function(comments){

        });

        $sailsSocket.subscribe('comment',function(msg){

            console.log(msg)
            $rootScope.comments.push(msg.data);


        })

//        $sailsSocket.on('comment',function(){ console.log(arguments)})

    })