//create a new module
angular.module('sailsDemoApp',['angularSails','ngAnimate','ngMaterial']).config(['$sailsProvider',function($sailsProvider){

    $sailsProvider.model('Message',{})

    $sailsProvider.model('User',{})





}])


    // .factory('Messages',function($sailsSocket){
    //
    //     var _messages = [];
    //
    //     var _handlers = {};
    //
    //     _handlers.created = function(msg){
    //         "use strict";
    //         _messages.push(msg.data);
    //     };
    //
    //     $sailsSocket.subscribe('message',function(msg){
    //         _handlers[msg.verb](msg)
    //     });
    //
    //     function _loadMessages(){
    //         return $sailsSocket.get('/message').then(function(res){
    //             angular.forEach(res.data,function(msg){
    //                 _messages.push(msg)
    //             });
    //             return _messages;
    //         })
    //
    //     }
    //
    //     function _sendMessage(msg){
    //         return $sailsSocket.post('/message',msg).then(function(res){
    //             "use strict";
    //             _messages.push(res.data);
    //             return res.data;
    //         })
    //     }
    //
    //
    //     return {
    //
    //         load : _loadMessages,
    //         send : _sendMessage
    //     };
    // })


    .controller('DemoCtrl',function(Message,User,$scope,$materialSidenav){

        $scope.tabs = [{name: 'home'},{name: 'docs'},{name: 'api'}]

        User.find().then(function(users){
            User.create({name: 'bob', password: 'bob'}).then(function(newUser){
                console.log(newUser)
            },function(err){
                console.log(err)
            })
        })

        $scope.openLeftMenu = function() {
          $materialSidenav('left').toggle();
        };


        Message.find().then(function(messages){
            console.log(messages)
        });

        // "use strict";
        //
        $scope.newMessage = {};

        $scope.postMessage = function(newMessage){
            Message.create(newMessage).then(function(createdMessage){
                $scope.messages.push(createdMessage);
                $scope.newMessage.body = '';
            })

        }

    }).directive('ig', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fid: '@'
    },
    template:
      '<material-input-group>' +
        '<label for="{{fid}}">Description</label>' +
        '<input id="{{fid}}" type="text" ng-model="data.description">' +
      '</material-input-group>'
  };
});
