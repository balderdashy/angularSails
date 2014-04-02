(function () {

    var app = angular.module('sailsDemoApp', ['sails','sails.resource']);

    app.config(['$sailsResourceProvider',function($sailsResourceProvider){



    }]);


    app.factory('Comment',['$sailsResource',function($sailsResource){

        function Comment(data){
            this.string('title');
            this.belongsTo('post')
        }

        var CommentModel = $sailsResource(Comment);

        CommentModel.api.set('http://localhost:1337');
        return CommentModel;

    }]);

    app.factory('Post',['$sailsResource',function($sailsResource){

        function Post(data){
            this.string('title');
            this.hasMany('comments',{provider : 'Comment'})
        }



        var PostModel = $sailsResource(Post)

        PostModel.api.set('http://localhost:1337');
        return PostModel;

    }]);


    app.controller('CommentCtrl', ['$scope','Comment','Post',function ($scope,Comment,Post) {

        Post.find().then(function(posts){
            console.log(posts)
            $scope.posts = posts;
        })

        $scope.addComment = function(newComment){

           var saveComment =  Comment.$create(newComment);

            saveComment.then(function(newComment){
                $scope.comments.push(newComment);
            })
        }

        $scope.addPost = function(newPost){

            var savePost =  Post.$create(newPost);

            savePost.then(function(newPost){
                $scope.posts.push(newPost);
            })
        }


    }]);

})();
