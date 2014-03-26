(function () {

  var app = angular.module('AngularSailsApp', ['angularSails.base']);

  app.controller('CommentsCtrl', ['$scope', '$sailsRef', function ($scope, $sailsRef) {

    // Get the comments from the sails server.
    $scope.comments = $sailsRef('/comment');

    // You can also add a second argument that is a query paramater to
    // get resources at endpoint that fulfulls the criteria.
    //
    // $scope.comments = $sails('/comment', {body: 'test'});

    // Adds a comment.
    $scope.addComment = function (e) {
      if (e.keyCode !== 13) return;
      $scope.comments.$add({
        body: $scope.newComment
      });
      $scope.newComment = '';
    };

    // Remove a comment.
    $scope.deleteComment = function (comment) {
      // $scope.comments.$remove(comment);
      // Now you can also update a comment like this:
      comment.$remove();
    };

    // Update a comment.
    $scope.updateComment = function (comment) {
      // $scope.comments.$update(comment);
      // Now you can also update a comment like this:
      comment.$update();
    };

  }]);

  app.controller('UserCtrl', ['$scope', '$sailsRef', function ($scope, $sailsRef) {

    // Get individual user resource;
    $scope.user = $sailsRef('/user/5');

    // update model
    $scope.updateUser = function () {
      $scope.user.$update();
    }

    // remove model
    $scope.removeUser = function () {
      $scope.user.$remove();
    }

  }]);

})();
