(function () {

  var app = angular.module('AngularSailsApp', ['angularSails.base']);

  app.controller('CommentCtrl', ['$scope', '$sails', function ($scope, $sails) {

    // Get the comments from the sails server.
    $scope.comments = $sails('/comment');

    // You can also add a second query paramater to get resources at endpoint that fulfull
    // the criteria.
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
      $scope.comments.$remove(comment);
      // Now you can also update a comment like this:
      // comment.$remove();
    };

    // Update a comment.
    $scope.updateComment = function (comment) {
      $scope.comments.$update(comment);
      // Now you can also update a comment like this:
      // comment.$update();
    };

  }]);

})();
