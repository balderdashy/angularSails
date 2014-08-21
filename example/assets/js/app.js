//create a new module
angular.module('sailsDemoApp',['angularSails','ngAnimate','ngMaterial']).config(['$sailsProvider',function($sailsProvider){




// }]).factory('Message',['$sailsSocket',function($sailsSocket){
//
//     $sailsSocket.on('message',function(message){
//         console.log(message)
//     })
//
//     return {
//         load: function(){
//             return $sailsSocket.get('/message').then(function(res){
//                 return res.data;
//             })
//         },
//         send: function(newMessage){
//             return $sailsSocket.post('/message',newMessage).then(function(res){
//                 return res.data;
//             })
//         }
//     }

}]).factory('Message',['$sailsResource',function($sailsResource){

    return $sailsResource('message',{
        attributes: {
            id: "string",
            body: "text"
        }
    });

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


    .controller('DemoCtrl',function(Message,$scope,$materialSidenav){

        $scope.tabs = [{name: 'home'},{name: 'docs'},{name: 'api'}]

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
