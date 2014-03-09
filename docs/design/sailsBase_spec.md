proposal for the firebase like usage.

```javascript

(function () {

  var app = angular.module('app', ['angularSails']);

  app.controller('fooCtrl', ['$scope', '$sails', function ($scope, $sails) {

    $scope.comments = $sails('/comments');

    $scope.comments.$add({
      from: 'something',
      body: 'this is some comment that someone wrote'
    });

  });

})()

```
