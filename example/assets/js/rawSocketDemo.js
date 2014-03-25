(function () {

    var app = angular.module('AngularSailsApp', ['angularSails.io']);

    app.factory('socket',['$sailsSocket', function($sailsSocket){

        return $sailsSocket()

    }])



    app.controller('CommentCtrl', ['$scope','socket',function ($scope,socket) {

        socket.on('comment',function(msg){
            console.log(msg)
        })

        socket.get('/comment').success(function(comments){
            $scope.comments = comments;
        })

        socket.post('/comment',{body : 'helloo sockets'}).then(function(newComment){
            console.log(newComment)
        })

        socket.get('/comments').success(function(comments){
            console.log(comments)
            $scope.comments = comments;
        })


        socket.connect().then(function(sock){
            console.log('connected',sock)



        },function(err){
            console.log('connection error',err)
        },function(not){
            console.log('connection update',not)
        })

        // Get the comments from the sails server.
        // $scope.comments = $sails('/comment');
        //
        // // Adds a comment.
        // $scope.addComment = function (e) {
        //   if (e.keyCode != 13) return;
        //
        //   $scope.comments.$add({
        //     body: $scope.newComment
        //   });
        //
        //   $scope.newComment = '';
        // };

    }]);

})();
