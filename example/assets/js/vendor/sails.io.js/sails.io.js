/**
 * sails.io.js
 * ------------------------------------------------------------------------
 * JavaScript Client (SDK) for communicating with Sails.
 * 
 * Note that this script is completely optional, but it is handy if you're
 * using WebSockets from the browser to talk to your Sails server.
 * 
 * For tips and documentation, visit:
 * http://sailsjs.org/#!documentation/reference/BrowserSDK/BrowserSDK.html
 * ------------------------------------------------------------------------
 * 
 * This file allows you to send and receive socket.io messages to & from Sails
 * by simulating a REST client interface on top of socket.io. It models its API
 * after the $.ajax pattern from jQuery you might already be familiar with.
 *
 * So if you're switching from using AJAX to sockets, instead of:
 *    `$.post( url, [data], [cb] )`
 *
 * You would use:
 *    `socket.post( url, [data], [cb] )`
 */


(function() {

  // Save the URL that this script was fetched from for use below.
  // (skip this if this SDK is being used outside of the DOM, i.e. in a Node process)
  var urlThisScriptWasFetchedFrom = (function() {
    if (
     typeof window !== 'object' ||
     typeof window.document !== 'object' ||
     typeof window.document.getElementsByTagName !== 'function'
    ) { return ''; }

    // Return the URL of the last script loaded (i.e. this one)
    // (this must run before nextTick; see http://stackoverflow.com/a/2976714/486547)
    var allScriptsCurrentlyInDOM = window.document.getElementsByTagName('script');
    var thisScript = allScriptsCurrentlyInDOM[allScriptsCurrentlyInDOM.length - 1];
    return thisScript.src;
  })();

  // Constants
  var CONNECTION_METADATA_PARAMS = {
    version: '__sails_io_sdk_version',
    platform: '__sails_io_sdk_platform',
    language: '__sails_io_sdk_language'
  };

  // Current version of this SDK (sailsDK?!?!) and other metadata
  // that will be sent along w/ the initial connection request.
  var SDK_INFO = {
    version: '0.10.0', // TODO: pull this automatically from package.json during build.
    platform: typeof module === 'undefined' ? 'browser' : 'node',
    language: 'javascript'
  };
  SDK_INFO.versionString =
    CONNECTION_METADATA_PARAMS.version + '=' + SDK_INFO.version + '&' +
    CONNECTION_METADATA_PARAMS.platform + '=' + SDK_INFO.platform + '&' +
    CONNECTION_METADATA_PARAMS.language + '=' + SDK_INFO.language;


  // In case you're wrapping the socket.io client to prevent pollution of the
  // global namespace, you can pass in your own `io` to replace the global one.
  // But we still grab access to the global one if it's available here:
  var _io = (typeof io !== 'undefined') ? io : null;

  /**
   * Augment the `io` object passed in with methods for talking and listening
   * to one or more Sails backend(s).  Automatically connects a socket and
   * exposes it on `io.socket`.  If a socket tries to make requests before it
   * is connected, the sails.io.js client will queue it up.
   *
   * @param {SocketIO} io
   */

  function SailsIOClient(io) {

    // Prefer the passed-in `io` instance, but also use the global one if we've got it.
    io = io || _io;

    // If the socket.io client is not available, none of this will work.
    if (!io) throw new Error('`sails.io.js` requires a socket.io client, but `io` was not passed in.');



    //////////////////////////////////////////////////////////////
    /////                              ///////////////////////////
    ///// PRIVATE METHODS/CONSTRUCTORS ///////////////////////////
    /////                              ///////////////////////////
    //////////////////////////////////////////////////////////////

    /**
     * TmpSocket
     *
     * A mock Socket used for binding events before the real thing
     * has been instantiated (since we need to use io.connect() to
     * instantiate the real thing, which would kick off the connection
     * process w/ the server, and we don't necessarily have the valid
     * configuration to know WHICH SERVER to talk to yet.)
     *
     * @api private
     * @constructor
     */

    function TmpSocket() {
      var boundEvents = {};
      this.on = function(evName, fn) {
        boundEvents[evName] = fn;
        return this;
      };
      this.become = function(actualSocket) {
        for (var evName in boundEvents) {
          actualSocket.on(evName, boundEvents[evName]);
        }
        return actualSocket;
      };
      this.get = Socket.prototype.get;
      this.post = Socket.prototype.post;
      this.put = Socket.prototype.put;
      this.delete = Socket.prototype.delete;
      this._request = Socket.prototype._request;
    }



    /**
     * A little logger for this library to use internally.
     * Basically just a wrapper around `console.log` with
     * support for feature-detection.
     *
     * @api private
     * @factory
     */
    function LoggerFactory(options) {
      options = options||{ prefix: true };

      // If `console.log` is not accessible, `log` is a noop.
      if (
       typeof console !== 'object' ||
       typeof console.log !== 'function' ||
       typeof console.log.bind !== 'function'
      )
      {
        return function noop() {};
      }

      return function log () {
        var args = Array.prototype.slice.call(arguments);
        
        // All logs are disabled when `io.sails.environment = 'production'`.
        if (io.sails.environment === 'production') return;

        // Add prefix to log messages (unless disabled)
        var PREFIX = '';
        if (options.prefix) { args.unshift(PREFIX); }

        // Call wrapped logger
        console.log
         .bind(console)
         .apply(this, args);
      };
    }

    // Create a private logger instance
    var consolog = LoggerFactory();
    consolog.noPrefix = LoggerFactory({ prefix: false });



    /**
     * isConnected
     *
     * @api private
     * @param  {Socket}  socket
     * @return {Boolean} whether the socket is connected and able to
     *                           communicate w/ the server.
     */

    function _isConnected(socket) {
      return socket.socket && socket.socket.connected;
    }



    /**
     * [ajax description]
     * @return {[type]} [description]
     */
    function ajax (opts, cb) {
      opts = opts || {};
      var xmlhttp;

      if (typeof window === 'undefined') {
        // TODO: refactor node usage in here
        return cb();
      }

      if (window.XMLHttpRequest) {
          // code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp = new XMLHttpRequest();
      } else {
          // code for IE6, IE5
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }

      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              cb(xmlhttp.responseText);
          }
      }

      xmlhttp.open(opts.method, opts.url, true);
      xmlhttp.send();
    }



    /**
     * The JWR (JSON WebSocket Response) received from a Sails server.
     *
     * @api private
     * @param  {Object}  responseCtx
     *         => :body
     *         => :statusCode
     *         => :headers
     * @constructor
     */

    function JWR(responseCtx) {
      this.body = responseCtx.body || {};
      this.headers = responseCtx.headers || {};
      this.statusCode = responseCtx.statusCode || 200;
    }
    JWR.prototype.toString = function() {
      return '[ResponseFromSails]' + '  -- ' +
        'Status: ' + this.statusCode + '  -- ' +
        'Headers: ' + this.headers + '  -- ' +
        'Body: ' + this.body;
    };
    JWR.prototype.toPOJO = function() {
      return {
        body: this.body,
        headers: this.headers,
        statusCode: this.statusCode
      };
    };
    JWR.prototype.pipe = function() {
      // TODO: look at substack's stuff
      return new Error('Not implemented yet.');
    };


    /**
     * @api private
     * @param  {Socket} socket  [description]
     * @param  {Object} requestCtx [description]
     */

    function _emitFrom(socket, requestCtx) {

      // Since callback is embedded in requestCtx,
      // retrieve it and delete the key before continuing.
      var cb = requestCtx.cb;
      delete requestCtx.cb;


      // Name of socket request listener on the server
      // ( === the request method, e.g. 'get', 'post', 'put', etc. )
      var sailsEndpoint = requestCtx.method;
      socket.emit(sailsEndpoint, requestCtx, function serverResponded(responseCtx) {

        // Adds backwards-compatibility for 0.9.x projects
        // If `responseCtx.body` does not exist, the entire
        // `responseCtx` object must actually be the `body`.
        var body;
        if (!responseCtx.body) {
          body = responseCtx;
        } else {
          body = responseCtx.body;
        }

        // Send back (emulatedHTTPBody, jsonWebSocketResponse)
        cb && cb(body, new JWR(responseCtx));
      });
    }

    //////////////////////////////////////////////////////////////
    ///// </PRIVATE METHODS/CONSTRUCTORS> ////////////////////////
    //////////////////////////////////////////////////////////////



    // We'll be adding methods to `io.SocketNamespace.prototype`, the prototype for the 
    // Socket instance returned when the browser connects with `io.connect()`
    var Socket = io.SocketNamespace;



    /**
     * Simulate a GET request to sails
     * e.g.
     *    `socket.get('/user/3', Stats.populate)`
     *
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} params ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    Socket.prototype.get = function(url, data, cb) {

      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this._request({
        method: 'get',
        data: data,
        url: url
      }, cb);
    };



    /**
     * Simulate a POST request to sails
     * e.g.
     *    `socket.post('/event', newMeeting, $spinner.hide)`
     *
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} params ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    Socket.prototype.post = function(url, data, cb) {

      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this._request({
        method: 'post',
        data: data,
        url: url
      }, cb);
    };



    /**
     * Simulate a PUT request to sails
     * e.g.
     *    `socket.post('/event/3', changedFields, $spinner.hide)`
     *
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} params ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    Socket.prototype.put = function(url, data, cb) {

      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this._request({
        method: 'put',
        data: data,
        url: url
      }, cb);
    };



    /**
     * Simulate a DELETE request to sails
     * e.g.
     *    `socket.delete('/event', $spinner.hide)`
     *
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} params ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    Socket.prototype['delete'] = function(url, data, cb) {

      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this._request({
        method: 'delete',
        data: data,
        url: url
      }, cb);
    };



    /**
     * Socket.prototype._request
     *
     * Simulate HTTP over Socket.io.
     *
     * @api private
     * @param  {[type]}   options [description]
     * @param  {Function} cb      [description]
     */
    Socket.prototype._request = function(options, cb) {

      // Sanitize options (also data & headers)
      var usage = 'Usage:\n socket.' +
        (options.method || 'request') +
        '( destinationURL, [dataToSend], [fnToCallWhenComplete] )';

      options = options || {};
      options.data = options.data || {};
      options.headers = options.headers || {};

      // Remove trailing slashes and spaces to make packets smaller.
      options.url = options.url.replace(/^(.+)\/*\s*$/, '$1');
      if (typeof options.url !== 'string') {
        throw new Error('Invalid or missing URL!\n' + usage);
      }

      var self = this;

      // Build a simulated request object.
      var request = {
        method: options.method,
        data: options.data,
        url: options.url,
        headers: options.headers,
        cb: cb
      };

      // If this socket is not connected yet, queue up this request
      // instead of sending it.
      // (so it can be replayed when the socket comes online.)
      if (!_isConnected(self)) {

        // If no queue array exists for this socket yet, create it.
        requestQueues[self.id] = requestQueues[self.id] || [];
        requestQueues[self.id].push(request);
        return;
      }


      // Otherwise, our socket is ok!
      // Send the request.
      _emitFrom(self, request);
    };



    // `requestQueues` and `sockets`
    // 
    // Used to simplify app-level connection logic-- i.e. so you don't
    // have to wait for the socket to be connected to start trying to 
    // synchronize data.
    // 
    // It supports use across multiple sockets, and ends up looking
    // something like:
    // {
    //   '9ha021381359': [{...queuedReq26...}, {...queuedReq27...}, ...],
    //   '2abcd8d8d211': [{...queuedReq18...}, {...queuedReq19...}, ...],
    //   '992294111131': [{...queuedReq11...}, {...queuedReq12...}, ...]
    // }
    var requestQueues = {};
    var sockets = {};


    // Set a `sails` object that may be used for configuration before the
    // first socket connects (i.e. to prevent auto-connect)
    io.sails = {

      // Whether to automatically connect a socket and save it as `io.socket`.
      autoConnect: true,

      // Whether to use JSONP to get a cookie for cross-origin requests
      useCORSRouteToGetCookie: true,

      // The environment we're running in.
      // (logs are not displayed when this is set to 'production')
      // 
      // Defaults to development unless this script was fetched from a URL
      // that ends in `*.min.js` or '#production' (may also be manually overridden.)
      // 
      environment: urlThisScriptWasFetchedFrom.match(/(\#production|\.min\.js)/) ? 'production' : 'development'
    };



    /**
     * Override `io.connect` to coerce it into using the io.sails
     * connection URL config, as well as sending identifying information
     * (most importantly, the current version of this SDK)
     *
     * @param  {String} url  [optional]
     * @param  {Object} opts [optional]
     * @return {Socket}
     */
    io.sails._origConnectFn = io.connect;
    io.connect = function(url, opts) {
      opts = opts || {};

      // If explicit connection url is specified, use it
      url = url || io.sails.url || undefined;

      // Ensure URL has no trailing slash
      url = url ? url.replace(/(\/)$/, '') : undefined;

      // Mix the current SDK version into the query string in
      // the connection request to the server:
      if (typeof opts.query !== 'string') opts.query = SDK_INFO.versionString;
      else opts.query += '&' + SDK_INFO.versionString;
      
      return io.sails._origConnectFn(url, opts);

    };



    // io.socket
    // 
    // The eager instance of Socket which will automatically try to connect
    // using the host that this js file was served from.
    // 
    // This can be disabled or configured by setting `io.socket.options` within the
    // first cycle of the event loop.
    // 

    // In the mean time, this eager socket will be defined as a TmpSocket
    // so that events bound by the user before the first cycle of the event
    // loop (using `.on()`) can be rebound on the true socket.
    io.socket = new TmpSocket();

    setTimeout(function() {

      // If autoConnect is disabled, delete the TmpSocket and bail out.
      if (!io.sails.autoConnect) {
        delete io.socket;
        return io;
      }

      // If this is an attempt at a cross-origin or cross-port
      // socket connection, send an AJAX request first to ensure
      // that a valid cookie is available.  This can be disabled
      // by setting `io.sails.useCORSRouteToGetCookie` to false.
      var isXOrigin = io.sails.url && true; //url.match();

      // var port = global.location.port || ('https:' == global.location.protocol ? 443 : 80);
      // this.options.host !== global.location.hostname || this.options.port != port;
      if (io.sails.useCORSRouteToGetCookie && isXOrigin) {

        // Figure out the x-origin CORS route
        // (Sails provides a default)
        var xOriginCookieRoute = '/__getcookie';
        if (typeof io.sails.useCORSRouteToGetCookie === 'string') {
          xOriginCookieRoute = io.sails.useCORSRouteToGetCookie;
        }

        var xOriginCookieURL = io.sails.url + xOriginCookieRoute;

        // Make the AJAX request (CORS)
        if (typeof window !== 'undefined') {
          // var script = window.document.createElement('script');
          // script.src = io.sails.url + xOriginCookieRoute;
          // script.async = true;

          // // Wait for script tag to finish loading
          // // (to guarantee we have the cookie)
          // var isReady = false;
          // script.onreadystatechange = script.onload = function() {
          //   var state = script.readyState;
          //   if (!isReady && (!state || /loaded|complete/.test(state))) {
          //     isReady = true;
          //     goAheadAndActuallyConnect();
          //   }
          // };
          // window.document.getElementsByTagName('head')[0].appendChild(script);

          ajax({
            url: xOriginCookieURL,
            method: 'GET'
          }, goAheadAndActuallyConnect);

        }

        // If there's no `window` object, we must be running in Node.js
        // so just require the request module and send the HTTP request that
        // way.
        else {
          var mikealsReq = require('request');
          mikealsReq.get(io.sails.url + xOriginCookieRoute, function (err, httpResponse, body) {
            if (err) {
              consolog(
               'Failed to connect socket (failed to get cookie)',
               'Error:', err
              );
              return;
            }
            goAheadAndActuallyConnect();
          });
        }
      }
      else goAheadAndActuallyConnect();
      
      // Start connecting after the current cycle of the event loop
      // has completed.
      // consolog('Auto-connecting `io.socket` to Sails... (requests will be queued in the mean-time)');
      function goAheadAndActuallyConnect () {

        // Initiate connection
        var actualSocket = io.connect(io.sails.url);

        // Replay event bindings from the existing TmpSocket
        io.socket = io.socket.become(actualSocket);


        /**
         * 'connect' event is triggered when the socket establishes a connection
         *  successfully.
         */
        io.socket.on('connect', function socketConnected() {

          consolog.noPrefix(
           '\n' +
           '    |>    ' + '\n' +
           '  \\___/  '
          );
          consolog(
           '`io.socket` connected successfully.'+ '\n' +
           // 'e.g. to send a GET request to Sails via WebSockets, run:'+ '\n' +
           // '`io.socket.get("/foo", function serverRespondedWith (body, jwr) { console.log(body); })`'+ '\n' +
           ' (for help, see: http://sailsjs.org/#!documentation/reference/BrowserSDK/BrowserSDK.html)'
          );
          // consolog('(this app is running in development mode - log messages will be displayed)');

          // Save reference to socket when it connects
          sockets[io.socket.id] = io.socket;

          // Run the request queue for each socket.
          for (var socketId in requestQueues) {
            var pendingRequestsForSocket = requestQueues[socketId];

            for (var i in pendingRequestsForSocket) {
              var pendingRequest = pendingRequestsForSocket[i];

              // Emit the request.
              _emitFrom(sockets[socketId], pendingRequest);
            }
          }



          /**
           * 'disconnect' event is triggered when the socket disconnects.
           */
          io.socket.on('disconnect', function() {
            consolog('io.socket was disconnected from Sails.');
          });




          /**
           * 'error' event is triggered if connection can not be established.
           * (usually because of a failed authorization, which is in turn
           * usually due to a missing or invalid cookie)
           */
          io.socket.on('error', function failedToConnect(err) {
            
            // TODO:
            // handle failed connections due to failed authorization
            // in a smarter way (probably can listen for a different event)
            
            consolog(
             'Failed to connect socket (probably due to failed authorization on server)',
             'Error:', err
            );
          });
        });

      }



      // TODO:
      // Listen for a special private message on any connected that allows the server
      // to set the environment (giving us 100% certainty that we guessed right)
      // However, note that the `console.log`s called before and after connection
      // are still forced to rely on our existing heuristics (to disable, tack #production
      // onto the URL used to fetch this file.)

    }, 0); // </setTimeout>


    // Return the `io` object.
    return io;
  }


  // Add CommonJS support to allow this client SDK to be used from Node.js.
  if (typeof module === 'object' && typeof module.exports !== 'undefined') {
    return module.exports = SailsIOClient;
  }

  // Otherwise, try to instantiate the client:
  // In case you're wrapping the socket.io client to prevent pollution of the
  // global namespace, you can replace the global `io` with your own `io` here:
  return SailsIOClient();

})();
