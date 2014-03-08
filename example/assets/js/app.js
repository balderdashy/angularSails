(function () {

  var app = angular.module('AngularSailsApp', ['angularSails']);

  app.controller('CommentCtrl', ['$scope', '$sails', function ($scope, $sails) {

    // Get the comments from the sails server.
    $scope.comments = $sails('/comment');

    // Adds a comment.
    $scope.addComment = function (e) {
      if (e.keyCode != 13) return;

      $scope.comments.$add({
        body: $scope.newComment
      });

      $scope.newComment = '';
    };

  }]);

})();
