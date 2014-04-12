angular.module('sailsDemoApp',['sails.io'])

    .controller('DemoCtrl',function($scope,$sailsSocket){
        "use strict";

        $sailsSocket.get('/comment').success(function(comments){
            $scope.comments = comments;
        });


        $scope.addComment  = function(){

            $sailsSocket.post('/comment',$scope.newComment).success(function(newComment){

                $scope.comments.push(newComment)

            });
        };


        $sailsSocket.subscribe('comment',function(msg){

            console.log(msg);
            $scope.comments.push(msg.data);
        })
    });