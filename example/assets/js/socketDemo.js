angular.module('sailsDemoApp',['sails.io'])

.config(function($sailsSocketProvider){
        "use strict";
        console.log($sailsSocketProvider)
    })
.run(function($sailsSocket,$rootScope){

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