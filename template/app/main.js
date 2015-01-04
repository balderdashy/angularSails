var app = angular.module('ngSailsApp',['ngSails']);

app.run(function($sails){

  $sails.connect('',{

  }).then(function(socket){
    console.log(socket)
    socket.get('/notification').then(function(res){
      console.log(res);
    }).catch(function(err){
      console.log(err);
    })
  })

});

angular.bootstrap(document,['ng','ngSailsApp']);
