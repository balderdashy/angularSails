## angularSails API (Proposed)

# angularSails
This is the core angularSails module, and the only *required* module to use angularSails, other than the socket.io client.

It exposes a `sailsSocketFactory` singleton that is used to open connection to a Sails instance.
## Usage


### Connecting to Sails

```javascript
// in the top-level module of the app
angular.module('mySailsApp', ['angularSails']).
factory('mySailsSocket', function (sailsSocketFactory)) {
  return sailsSocketFactory();
});
```


## SailsSocket API

### `socket.on` / `socket.addListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `socket.removeListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `socket.emit`
Sends a message to the server.
Optionally takes a callback.

Works just like the method of the same name from Socket.IO.

### `socket.forward`

`socket.forward` allows you to forward the events received by Socket.IO's socket to AngularJS's event system.
You can then listen to the event with `$scope.$on`.
By default, socket-forwarded events are namespaced with `sails:`.

The first argument is a string or array of strings listing the event names to be forwarded.
The second argument is optional, and is the scope on which the events are to be broadcast.
If an argument is not provided, it defaults to `$rootScope`.
As a reminder, broadcasted events are propagated down to descendant scopes.

####CRUD Functionality

### `socket.get( url, queryParams)`
Simulates a GET request over Socket.io.
Returns a promise.

### `socket.post ( url, data )`
Simulates a GET request over Socket.io.
Returns a promise.

### `socket.put ( url, data )`
SSimulates a GET request over Socket.io.
Returns a promise.

### `socket.delete ( url, data )`
Simulates a GET request over Socket.io.
Returns a promise.


##sailsSocketFactory ` sailsSocketFactory( options ) `
Factory that generates new sailsSocket connections. Allows connections to multiple Sails endpoints and returns a wrapped socket.io connection.

  ### `sailsSocketFactory({ ioSocket: }}`

This option allows you to provide the `socket` service with a `Socket.IO socket` object to be used internally.
This is useful if you want to connect on a different path, or need to hold a reference to the `Socket.IO socket` object for use elsewhere.

```javascript
angular.module('mySailsApp', [
  'angularSails'
]).
factory('mySailsSocket', function (sailSocketFactory)) {
  var myIoSocket = io.connect('/some/path');

  mySocket = sailsSocketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
});
```

### `socketFactory({ scope: })`

This option allows you to set the scope on which `$broadcast` is forwarded to when using the `forward` method.
It defaults to `$rootScope`.


### `socketFactory({ prefix: })`

The default prefix is `sails:`.


#### Example

TODO
