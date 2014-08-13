//create a new module
angular.module('sailsDemoApp',['angularSails']).config(['$sailsProvider',function($sailsProvider){

    $sailsProvider.model('Message',{})


}]).factory('User',['$sails',function($sails){

    return $sails.model('User',{})
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


    .controller('DemoCtrl',function(Message,User,$scope){

        Message.find();
        User.find()
        // "use strict";
        //
        // $scope.newMessage = {};
        //
        // Messages.load().then(function(messages){
        //     $scope.messages = messages;
        // });
        //
        // $scope.postMessage = function(newMessage){
        //     Messages.send(newMessage).then(function(){
        //         $scope.newMessage.body = '';
        //     })
        //
        // }

    });
