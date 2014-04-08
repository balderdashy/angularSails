angular.module('sailsDemoApp',['sails.io'])
.factory('DemoSocket',function($sailsSocket){

        return $sailsSocket()

    })
.run(function(DemoSocket){

        window.sailsSocket = DemoSocket;
        DemoSocket.get('/comment').success(function(comments){
            console.log(comments)
        })

        DemoSocket.on('comment',function(){ console.log(arguments)})

    })