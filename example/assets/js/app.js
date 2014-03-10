(function () {

  var app = angular.module('AngularSailsApp', ['angularSails.base']);

  app.controller('CommentCtrl', ['$scope', '$sails', function ($scope, $sails) {

    // Get the comments from the sails server.
    $scope.comments = $sails('/comment');

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
      $scope.comments.$remove(comment);

      // TODO: ideally I'd like to get this to a point that looked like the code below
      //
      // comment.$remove();
    };

    // Update a comment.
    $scope.updateComment = function (comment) {
      $scope.comments.$update(comment);

      // TODO: ideally I'd like to get this to a point that looked like the code below
      //
      // comment.$update();
    };

  }]);

})();
