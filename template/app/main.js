var app = angular.module('ngSailsApp',['ngSails']);

app.run(function($sails){

  console.log($sails)

  $sails
  .connect()
  .then(function(socket){

    return $sails.post('/notification',{}).then(function(notification){
      console.log(notification)
      return $sails.get('/notification');
    });


  })
  .then(function(notifications){
    console.log(notifications)
  })
  .catch(function(err){
    console.log(err);
  })


});

angular.bootstrap(document,['ng','ngSailsApp']);
