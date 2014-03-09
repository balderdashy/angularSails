#angularSails

##Conceptual

angularSails - a set of angularJS modules for easy and powerful integration with Sails.

###Principles
- model focused - angular speaks objects. sails provides objects. send objects. receive objects. think with objects.
- modularity - developers should be able to use as much or as little functionality as they choose.
- familiar - wherever possible, allow developers to use consistent terminology client and server. (is there a word for this?)
- knowledge re-use - model schemas, routing, etc - where appropriate, expose server logic to client for automatic configuration.
- streams - angularSails is not a truck you can just dump stuff in. It is a series of tubes.
- promises - use angular's $q to the fullest extent allowable by law.
- bindings - once, two-way, three-way. Whatever floats your boat.
- pragmatic REST - urls represent resources. hide complexity behind the ?. with REST, all things are possible. mostly.
- easy button - provide a sensible set of defaults to provide immediate real-time endorphin-rush.
- extendable - its just a stream, y'all.
- JS everywhere. browser. phonegap. chrome app. appleTV?
- automation - yes.
- testing - yes. lots.
- demos - should be shiny.


##Stack

###angularSails `angular-sails.js`
Core module for angularSails SDK

###angularSails.io `angular-sails-socket.js`
Wrapper around Socket.io client, with functionality for Sails and Angular.

###angularSails.stream `angular-sails-stream.js`
Simple pubsub/promise module for sailsSockets.

###angularSails.model `angular-sails-model.js`
Sails Model functionality on the client side.

###angularSails.base `angular-sails-base.js`
Firebase-like functionality via SailsJS
