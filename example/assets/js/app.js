(function () {

    // Sample application demonstrating $sailsResource.

    // Our angular application (module) - it's connected to index.html using the <ng-app="sailsDemoApp">
    // it injects (or "requires") both the sails
    var app = angular.module('sailsDemoApp', ['sails.io']);




    app.run(['$sailsSocket',function(sails){

        console.log('running sails demo app...')
        console.log(sails)
    }])


//    app.factory('Comment',['$sailsResource',function($sailsResource){
//
//        var commentModel = {
//
//            identity : 'comment',
//            connection : 'httpTest',
//            attributes: {
//                //simple attributes
//                title : 'string',
//                body : 'string',
//
//                //complex attrs
//                email : { type : 'email'},
//
//
//                post : { model : 'Post'}
//
//            }
//        };
//
//        var CommentModel = $sailsResource(commentModel);
//
//
//        return CommentModel;
//
//    }]);
//
//    app.factory('Post',['$sailsResource',function($sailsResource){
//
//        var postModel = {
//            identity : 'post',
//            connection : 'httpTest',
//            attributes: {
//
//                title : { type : 'string', required : true },
//                comments : { collection : 'Comment', via : 'post'}
//
//            }
//        };
//
//
//        var PostModel = $sailsResource(postModel)
//
//
//        return PostModel;
//
//    }]);
//
//
//    app.controller('CommentCtrl', ['$scope','Comment','Post','TestModel',function ($scope,Comment,Post,TestModel) {
//
//        Post.find().then(function(posts){
//            console.log(posts)
//            $scope.posts = posts;
//        })
//
//        $scope.addComment = function(newComment){
//
//           var saveComment =  Comment.$create(newComment);
//
//            saveComment.then(function(newComment){
//                $scope.comments.push(newComment);
//            })
//        }
//
//        $scope.addPost = function(newPost){
//
//            var savePost =  Post.$create(newPost);
//
//            savePost.then(function(newPost){
//                $scope.posts.push(newPost);
//            })
//        }
//
//
//    }]);
//
})();
