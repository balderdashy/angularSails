## angularSails

##THIS IS A PROTOTYPE - NOT FOR PRODUCTION USE !

# sailsSocket
This is the core communications module, and the only *required* module to use angularSails, other than the socket.io client.

It exposes a `sailsSocketFactory` singleton that is used to open connection to a Sails instance.

It returns an instance of a ` sailsSocket ` - a wrapped connection that:
- adds http-style methods that return promises
- integrates socket messages into Angular's digest loop, so you don't have to do $scope.$apply everywhere.
- allows you to forward socket messages via Angular's $broadcast / $on event system.

## Usage


### Connecting to Sails

```javascript
// in the top-level module of the app
angular.module('mySailsApp', ['angularSails.io']).
factory('mySailsSocket', function (sailsSocketFactory)) {
  return sailsSocketFactory();
});
```


## sailsSocket API

### `sailsSocket.on` / `socket.addListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `sailsSocket.removeListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `sailsSocket.emit`
Sends a message to the server.
Optionally takes a callback.

Works just like the method of the same name from Socket.IO.

### `sailsSocket.forward`

`sailsSocket.forward` allows you to forward the events received by Socket.IO's socket to AngularJS's event system.
You can then listen to the event with `$scope.$on`.
By default, socket-forwarded events are namespaced with `sails:`.

The first argument is a string or array of strings listing the event names to be forwarded.
The second argument is optional, and is the scope on which the events are to be broadcast.
If an argument is not provided, it defaults to `$rootScope`.
As a reminder, broadcasted events are propagated down to descendant scopes.

####CRUD Functionality

### `sailsSocket.get( url, queryParams)`
Simulates a GET request over Socket.io.
Returns a promise.

### `sailsSocket.post ( url, data )`
Simulates a GET request over Socket.io.
Returns a promise.

### `sailsSocket.put ( url, data )`
SSimulates a GET request over Socket.io.
Returns a promise.

### `sailsSocket.delete ( url, data )`
Simulates a GET request over Socket.io.
Returns a promise.


###sailsSocketFactory ` sailsSocketFactory( options ) `
Factory that generates new sailsSocket connections. Allows connections to multiple Sails endpoints and returns a wrapped socket.io connection.

### `sailsSocketFactory({ ioSocket: }}`

This option allows you to provide the `socket` service with a `Socket.IO socket` object to be used internally.
This is useful if you want to connect on a different path, or need to hold a reference to the `Socket.IO socket` object for use elsewhere.

```javascript
angular.module('mySailsApp', [
  'angularSails.io'
]).
factory('mySailsSocket', function (sailSocketFactory)) {
  var myIoSocket = io.connect('/some/path');

  mySocket = sailsSocketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
});
```

### `sailsSocketFactory({ baseUrl: })`

This option allows you to set the url to use when connecting to Sails.

### `sailsSocketFactory({ scope: })`

This option allows you to set the scope on which `$broadcast` is forwarded to when using the `forward` method.
It defaults to `$rootScope`.


### `sailsSocketFactory({ prefix: })`

The default prefix is `sails:`.


#### Example

TODO
