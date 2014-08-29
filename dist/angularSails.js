/*! Socket.IO.min.js build:0.9.16, production. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */
var io="undefined"==typeof module?{}:module.exports;(function(){(function(a,b){var c=a;c.version="0.9.16",c.protocol=1,c.transports=[],c.j=[],c.sockets={},c.connect=function(a,d){var e=c.util.parseUri(a),f,g;b&&b.location&&(e.protocol=e.protocol||b.location.protocol.slice(0,-1),e.host=e.host||(b.document?b.document.domain:b.location.hostname),e.port=e.port||b.location.port),f=c.util.uniqueUri(e);var h={host:e.host,secure:"https"==e.protocol,port:e.port||("https"==e.protocol?443:80),query:e.query||""};c.util.merge(h,d);if(h["force new connection"]||!c.sockets[f])g=new c.Socket(h);return!h["force new connection"]&&g&&(c.sockets[f]=g),g=g||c.sockets[f],g.of(e.path.length>1?e.path:"")}})("object"==typeof module?module.exports:this.io={},this),function(a,b){var c=a.util={},d=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,e=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];c.parseUri=function(a){var b=d.exec(a||""),c={},f=14;while(f--)c[e[f]]=b[f]||"";return c},c.uniqueUri=function(a){var c=a.protocol,d=a.host,e=a.port;return"document"in b?(d=d||document.domain,e=e||(c=="https"&&document.location.protocol!=="https:"?443:document.location.port)):(d=d||"localhost",!e&&c=="https"&&(e=443)),(c||"http")+"://"+d+":"+(e||80)},c.query=function(a,b){var d=c.chunkQuery(a||""),e=[];c.merge(d,c.chunkQuery(b||""));for(var f in d)d.hasOwnProperty(f)&&e.push(f+"="+d[f]);return e.length?"?"+e.join("&"):""},c.chunkQuery=function(a){var b={},c=a.split("&"),d=0,e=c.length,f;for(;d<e;++d)f=c[d].split("="),f[0]&&(b[f[0]]=f[1]);return b};var f=!1;c.load=function(a){if("document"in b&&document.readyState==="complete"||f)return a();c.on(b,"load",a,!1)},c.on=function(a,b,c,d){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener&&a.addEventListener(b,c,d)},c.request=function(a){if(a&&"undefined"!=typeof XDomainRequest&&!c.ua.hasCORS)return new XDomainRequest;if("undefined"!=typeof XMLHttpRequest&&(!a||c.ua.hasCORS))return new XMLHttpRequest;if(!a)try{return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")}catch(b){}return null},"undefined"!=typeof window&&c.load(function(){f=!0}),c.defer=function(a){if(!c.ua.webkit||"undefined"!=typeof importScripts)return a();c.load(function(){setTimeout(a,100)})},c.merge=function(b,d,e,f){var g=f||[],h=typeof e=="undefined"?2:e,i;for(i in d)d.hasOwnProperty(i)&&c.indexOf(g,i)<0&&(typeof b[i]!="object"||!h?(b[i]=d[i],g.push(d[i])):c.merge(b[i],d[i],h-1,g));return b},c.mixin=function(a,b){c.merge(a.prototype,b.prototype)},c.inherit=function(a,b){function c(){}c.prototype=b.prototype,a.prototype=new c},c.isArray=Array.isArray||function(a){return Object.prototype.toString.call(a)==="[object Array]"},c.intersect=function(a,b){var d=[],e=a.length>b.length?a:b,f=a.length>b.length?b:a;for(var g=0,h=f.length;g<h;g++)~c.indexOf(e,f[g])&&d.push(f[g]);return d},c.indexOf=function(a,b,c){for(var d=a.length,c=c<0?c+d<0?0:c+d:c||0;c<d&&a[c]!==b;c++);return d<=c?-1:c},c.toArray=function(a){var b=[];for(var c=0,d=a.length;c<d;c++)b.push(a[c]);return b},c.ua={},c.ua.hasCORS="undefined"!=typeof XMLHttpRequest&&function(){try{var a=new XMLHttpRequest}catch(b){return!1}return a.withCredentials!=undefined}(),c.ua.webkit="undefined"!=typeof navigator&&/webkit/i.test(navigator.userAgent),c.ua.iDevice="undefined"!=typeof navigator&&/iPad|iPhone|iPod/i.test(navigator.userAgent)}("undefined"!=typeof io?io:module.exports,this),function(a,b){function c(){}a.EventEmitter=c,c.prototype.on=function(a,c){return this.$events||(this.$events={}),this.$events[a]?b.util.isArray(this.$events[a])?this.$events[a].push(c):this.$events[a]=[this.$events[a],c]:this.$events[a]=c,this},c.prototype.addListener=c.prototype.on,c.prototype.once=function(a,b){function d(){c.removeListener(a,d),b.apply(this,arguments)}var c=this;return d.listener=b,this.on(a,d),this},c.prototype.removeListener=function(a,c){if(this.$events&&this.$events[a]){var d=this.$events[a];if(b.util.isArray(d)){var e=-1;for(var f=0,g=d.length;f<g;f++)if(d[f]===c||d[f].listener&&d[f].listener===c){e=f;break}if(e<0)return this;d.splice(e,1),d.length||delete this.$events[a]}else(d===c||d.listener&&d.listener===c)&&delete this.$events[a]}return this},c.prototype.removeAllListeners=function(a){return a===undefined?(this.$events={},this):(this.$events&&this.$events[a]&&(this.$events[a]=null),this)},c.prototype.listeners=function(a){return this.$events||(this.$events={}),this.$events[a]||(this.$events[a]=[]),b.util.isArray(this.$events[a])||(this.$events[a]=[this.$events[a]]),this.$events[a]},c.prototype.emit=function(a){if(!this.$events)return!1;var c=this.$events[a];if(!c)return!1;var d=Array.prototype.slice.call(arguments,1);if("function"==typeof c)c.apply(this,d);else{if(!b.util.isArray(c))return!1;var e=c.slice();for(var f=0,g=e.length;f<g;f++)e[f].apply(this,d)}return!0}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(exports,nativeJSON){function f(a){return a<10?"0"+a:a}function date(a,b){return isFinite(a.valueOf())?a.getUTCFullYear()+"-"+f(a.getUTCMonth()+1)+"-"+f(a.getUTCDate())+"T"+f(a.getUTCHours())+":"+f(a.getUTCMinutes())+":"+f(a.getUTCSeconds())+"Z":null}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i instanceof Date&&(i=date(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";return e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"use strict";if(nativeJSON&&nativeJSON.parse)return exports.JSON={parse:nativeJSON.parse,stringify:nativeJSON.stringify};var JSON=exports.JSON={},cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")},JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")}}("undefined"!=typeof io?io:module.exports,typeof JSON!="undefined"?JSON:undefined),function(a,b){var c=a.parser={},d=c.packets=["disconnect","connect","heartbeat","message","json","event","ack","error","noop"],e=c.reasons=["transport not supported","client not handshaken","unauthorized"],f=c.advice=["reconnect"],g=b.JSON,h=b.util.indexOf;c.encodePacket=function(a){var b=h(d,a.type),c=a.id||"",i=a.endpoint||"",j=a.ack,k=null;switch(a.type){case"error":var l=a.reason?h(e,a.reason):"",m=a.advice?h(f,a.advice):"";if(l!==""||m!=="")k=l+(m!==""?"+"+m:"");break;case"message":a.data!==""&&(k=a.data);break;case"event":var n={name:a.name};a.args&&a.args.length&&(n.args=a.args),k=g.stringify(n);break;case"json":k=g.stringify(a.data);break;case"connect":a.qs&&(k=a.qs);break;case"ack":k=a.ackId+(a.args&&a.args.length?"+"+g.stringify(a.args):"")}var o=[b,c+(j=="data"?"+":""),i];return k!==null&&k!==undefined&&o.push(k),o.join(":")},c.encodePayload=function(a){var b="";if(a.length==1)return a[0];for(var c=0,d=a.length;c<d;c++){var e=a[c];b+="\ufffd"+e.length+"\ufffd"+a[c]}return b};var i=/([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;c.decodePacket=function(a){var b=a.match(i);if(!b)return{};var c=b[2]||"",a=b[5]||"",h={type:d[b[1]],endpoint:b[4]||""};c&&(h.id=c,b[3]?h.ack="data":h.ack=!0);switch(h.type){case"error":var b=a.split("+");h.reason=e[b[0]]||"",h.advice=f[b[1]]||"";break;case"message":h.data=a||"";break;case"event":try{var j=g.parse(a);h.name=j.name,h.args=j.args}catch(k){}h.args=h.args||[];break;case"json":try{h.data=g.parse(a)}catch(k){}break;case"connect":h.qs=a||"";break;case"ack":var b=a.match(/^([0-9]+)(\+)?(.*)/);if(b){h.ackId=b[1],h.args=[];if(b[3])try{h.args=b[3]?g.parse(b[3]):[]}catch(k){}}break;case"disconnect":case"heartbeat":}return h},c.decodePayload=function(a){if(a.charAt(0)=="\ufffd"){var b=[];for(var d=1,e="";d<a.length;d++)a.charAt(d)=="\ufffd"?(b.push(c.decodePacket(a.substr(d+1).substr(0,e))),d+=Number(e)+1,e=""):e+=a.charAt(d);return b}return[c.decodePacket(a)]}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b){function c(a,b){this.socket=a,this.sessid=b}a.Transport=c,b.util.mixin(c,b.EventEmitter),c.prototype.heartbeats=function(){return!0},c.prototype.onData=function(a){this.clearCloseTimeout(),(this.socket.connected||this.socket.connecting||this.socket.reconnecting)&&this.setCloseTimeout();if(a!==""){var c=b.parser.decodePayload(a);if(c&&c.length)for(var d=0,e=c.length;d<e;d++)this.onPacket(c[d])}return this},c.prototype.onPacket=function(a){return this.socket.setHeartbeatTimeout(),a.type=="heartbeat"?this.onHeartbeat():(a.type=="connect"&&a.endpoint==""&&this.onConnect(),a.type=="error"&&a.advice=="reconnect"&&(this.isOpen=!1),this.socket.onPacket(a),this)},c.prototype.setCloseTimeout=function(){if(!this.closeTimeout){var a=this;this.closeTimeout=setTimeout(function(){a.onDisconnect()},this.socket.closeTimeout)}},c.prototype.onDisconnect=function(){return this.isOpen&&this.close(),this.clearTimeouts(),this.socket.onDisconnect(),this},c.prototype.onConnect=function(){return this.socket.onConnect(),this},c.prototype.clearCloseTimeout=function(){this.closeTimeout&&(clearTimeout(this.closeTimeout),this.closeTimeout=null)},c.prototype.clearTimeouts=function(){this.clearCloseTimeout(),this.reopenTimeout&&clearTimeout(this.reopenTimeout)},c.prototype.packet=function(a){this.send(b.parser.encodePacket(a))},c.prototype.onHeartbeat=function(a){this.packet({type:"heartbeat"})},c.prototype.onOpen=function(){this.isOpen=!0,this.clearCloseTimeout(),this.socket.onOpen()},c.prototype.onClose=function(){var a=this;this.isOpen=!1,this.socket.onClose(),this.onDisconnect()},c.prototype.prepareUrl=function(){var a=this.socket.options;return this.scheme()+"://"+a.host+":"+a.port+"/"+a.resource+"/"+b.protocol+"/"+this.name+"/"+this.sessid},c.prototype.ready=function(a,b){b.call(this)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(a){this.options={port:80,secure:!1,document:"document"in c?document:!1,resource:"socket.io",transports:b.transports,"connect timeout":1e4,"try multiple transports":!0,reconnect:!0,"reconnection delay":500,"reconnection limit":Infinity,"reopen delay":3e3,"max reconnection attempts":10,"sync disconnect on unload":!1,"auto connect":!0,"flash policy port":10843,manualFlush:!1},b.util.merge(this.options,a),this.connected=!1,this.open=!1,this.connecting=!1,this.reconnecting=!1,this.namespaces={},this.buffer=[],this.doBuffer=!1;if(this.options["sync disconnect on unload"]&&(!this.isXDomain()||b.util.ua.hasCORS)){var d=this;b.util.on(c,"beforeunload",function(){d.disconnectSync()},!1)}this.options["auto connect"]&&this.connect()}function e(){}a.Socket=d,b.util.mixin(d,b.EventEmitter),d.prototype.of=function(a){return this.namespaces[a]||(this.namespaces[a]=new b.SocketNamespace(this,a),a!==""&&this.namespaces[a].packet({type:"connect"})),this.namespaces[a]},d.prototype.publish=function(){this.emit.apply(this,arguments);var a;for(var b in this.namespaces)this.namespaces.hasOwnProperty(b)&&(a=this.of(b),a.$emit.apply(a,arguments))},d.prototype.handshake=function(a){function f(b){b instanceof Error?(c.connecting=!1,c.onError(b.message)):a.apply(null,b.split(":"))}var c=this,d=this.options,g=["http"+(d.secure?"s":"")+":/",d.host+":"+d.port,d.resource,b.protocol,b.util.query(this.options.query,"t="+ +(new Date))].join("/");if(this.isXDomain()&&!b.util.ua.hasCORS){var h=document.getElementsByTagName("script")[0],i=document.createElement("script");i.src=g+"&jsonp="+b.j.length,h.parentNode.insertBefore(i,h),b.j.push(function(a){f(a),i.parentNode.removeChild(i)})}else{var j=b.util.request();j.open("GET",g,!0),this.isXDomain()&&(j.withCredentials=!0),j.onreadystatechange=function(){j.readyState==4&&(j.onreadystatechange=e,j.status==200?f(j.responseText):j.status==403?c.onError(j.responseText):(c.connecting=!1,!c.reconnecting&&c.onError(j.responseText)))},j.send(null)}},d.prototype.getTransport=function(a){var c=a||this.transports,d;for(var e=0,f;f=c[e];e++)if(b.Transport[f]&&b.Transport[f].check(this)&&(!this.isXDomain()||b.Transport[f].xdomainCheck(this)))return new b.Transport[f](this,this.sessionid);return null},d.prototype.connect=function(a){if(this.connecting)return this;var c=this;return c.connecting=!0,this.handshake(function(d,e,f,g){function h(a){c.transport&&c.transport.clearTimeouts(),c.transport=c.getTransport(a);if(!c.transport)return c.publish("connect_failed");c.transport.ready(c,function(){c.connecting=!0,c.publish("connecting",c.transport.name),c.transport.open(),c.options["connect timeout"]&&(c.connectTimeoutTimer=setTimeout(function(){if(!c.connected){c.connecting=!1;if(c.options["try multiple transports"]){var a=c.transports;while(a.length>0&&a.splice(0,1)[0]!=c.transport.name);a.length?h(a):c.publish("connect_failed")}}},c.options["connect timeout"]))})}c.sessionid=d,c.closeTimeout=f*1e3,c.heartbeatTimeout=e*1e3,c.transports||(c.transports=c.origTransports=g?b.util.intersect(g.split(","),c.options.transports):c.options.transports),c.setHeartbeatTimeout(),h(c.transports),c.once("connect",function(){clearTimeout(c.connectTimeoutTimer),a&&typeof a=="function"&&a()})}),this},d.prototype.setHeartbeatTimeout=function(){clearTimeout(this.heartbeatTimeoutTimer);if(this.transport&&!this.transport.heartbeats())return;var a=this;this.heartbeatTimeoutTimer=setTimeout(function(){a.transport.onClose()},this.heartbeatTimeout)},d.prototype.packet=function(a){return this.connected&&!this.doBuffer?this.transport.packet(a):this.buffer.push(a),this},d.prototype.setBuffer=function(a){this.doBuffer=a,!a&&this.connected&&this.buffer.length&&(this.options.manualFlush||this.flushBuffer())},d.prototype.flushBuffer=function(){this.transport.payload(this.buffer),this.buffer=[]},d.prototype.disconnect=function(){if(this.connected||this.connecting)this.open&&this.of("").packet({type:"disconnect"}),this.onDisconnect("booted");return this},d.prototype.disconnectSync=function(){var a=b.util.request(),c=["http"+(this.options.secure?"s":"")+":/",this.options.host+":"+this.options.port,this.options.resource,b.protocol,"",this.sessionid].join("/")+"/?disconnect=1";a.open("GET",c,!1),a.send(null),this.onDisconnect("booted")},d.prototype.isXDomain=function(){var a=c.location.port||("https:"==c.location.protocol?443:80);return this.options.host!==c.location.hostname||this.options.port!=a},d.prototype.onConnect=function(){this.connected||(this.connected=!0,this.connecting=!1,this.doBuffer||this.setBuffer(!1),this.emit("connect"))},d.prototype.onOpen=function(){this.open=!0},d.prototype.onClose=function(){this.open=!1,clearTimeout(this.heartbeatTimeoutTimer)},d.prototype.onPacket=function(a){this.of(a.endpoint).onPacket(a)},d.prototype.onError=function(a){a&&a.advice&&a.advice==="reconnect"&&(this.connected||this.connecting)&&(this.disconnect(),this.options.reconnect&&this.reconnect()),this.publish("error",a&&a.reason?a.reason:a)},d.prototype.onDisconnect=function(a){var b=this.connected,c=this.connecting;this.connected=!1,this.connecting=!1,this.open=!1;if(b||c)this.transport.close(),this.transport.clearTimeouts(),b&&(this.publish("disconnect",a),"booted"!=a&&this.options.reconnect&&!this.reconnecting&&this.reconnect())},d.prototype.reconnect=function(){function e(){if(a.connected){for(var b in a.namespaces)a.namespaces.hasOwnProperty(b)&&""!==b&&a.namespaces[b].packet({type:"connect"});a.publish("reconnect",a.transport.name,a.reconnectionAttempts)}clearTimeout(a.reconnectionTimer),a.removeListener("connect_failed",f),a.removeListener("connect",f),a.reconnecting=!1,delete a.reconnectionAttempts,delete a.reconnectionDelay,delete a.reconnectionTimer,delete a.redoTransports,a.options["try multiple transports"]=c}function f(){if(!a.reconnecting)return;if(a.connected)return e();if(a.connecting&&a.reconnecting)return a.reconnectionTimer=setTimeout(f,1e3);a.reconnectionAttempts++>=b?a.redoTransports?(a.publish("reconnect_failed"),e()):(a.on("connect_failed",f),a.options["try multiple transports"]=!0,a.transports=a.origTransports,a.transport=a.getTransport(),a.redoTransports=!0,a.connect()):(a.reconnectionDelay<d&&(a.reconnectionDelay*=2),a.connect(),a.publish("reconnecting",a.reconnectionDelay,a.reconnectionAttempts),a.reconnectionTimer=setTimeout(f,a.reconnectionDelay))}this.reconnecting=!0,this.reconnectionAttempts=0,this.reconnectionDelay=this.options["reconnection delay"];var a=this,b=this.options["max reconnection attempts"],c=this.options["try multiple transports"],d=this.options["reconnection limit"];this.options["try multiple transports"]=!1,this.reconnectionTimer=setTimeout(f,this.reconnectionDelay),this.on("connect",f)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(a,b){this.socket=a,this.name=b||"",this.flags={},this.json=new d(this,"json"),this.ackPackets=0,this.acks={}}function d(a,b){this.namespace=a,this.name=b}a.SocketNamespace=c,b.util.mixin(c,b.EventEmitter),c.prototype.$emit=b.EventEmitter.prototype.emit,c.prototype.of=function(){return this.socket.of.apply(this.socket,arguments)},c.prototype.packet=function(a){return a.endpoint=this.name,this.socket.packet(a),this.flags={},this},c.prototype.send=function(a,b){var c={type:this.flags.json?"json":"message",data:a};return"function"==typeof b&&(c.id=++this.ackPackets,c.ack=!0,this.acks[c.id]=b),this.packet(c)},c.prototype.emit=function(a){var b=Array.prototype.slice.call(arguments,1),c=b[b.length-1],d={type:"event",name:a};return"function"==typeof c&&(d.id=++this.ackPackets,d.ack="data",this.acks[d.id]=c,b=b.slice(0,b.length-1)),d.args=b,this.packet(d)},c.prototype.disconnect=function(){return this.name===""?this.socket.disconnect():(this.packet({type:"disconnect"}),this.$emit("disconnect")),this},c.prototype.onPacket=function(a){function d(){c.packet({type:"ack",args:b.util.toArray(arguments),ackId:a.id})}var c=this;switch(a.type){case"connect":this.$emit("connect");break;case"disconnect":this.name===""?this.socket.onDisconnect(a.reason||"booted"):this.$emit("disconnect",a.reason);break;case"message":case"json":var e=["message",a.data];a.ack=="data"?e.push(d):a.ack&&this.packet({type:"ack",ackId:a.id}),this.$emit.apply(this,e);break;case"event":var e=[a.name].concat(a.args);a.ack=="data"&&e.push(d),this.$emit.apply(this,e);break;case"ack":this.acks[a.ackId]&&(this.acks[a.ackId].apply(this,a.args),delete this.acks[a.ackId]);break;case"error":a.advice?this.socket.onError(a):a.reason=="unauthorized"?this.$emit("connect_failed",a.reason):this.$emit("error",a.reason)}},d.prototype.send=function(){this.namespace.flags[this.name]=!0,this.namespace.send.apply(this.namespace,arguments)},d.prototype.emit=function(){this.namespace.flags[this.name]=!0,this.namespace.emit.apply(this.namespace,arguments)}}("undefined"!=typeof io?io:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(a){b.Transport.apply(this,arguments)}a.websocket=d,b.util.inherit(d,b.Transport),d.prototype.name="websocket",d.prototype.open=function(){var a=b.util.query(this.socket.options.query),d=this,e;return e||(e=c.MozWebSocket||c.WebSocket),this.websocket=new e(this.prepareUrl()+a),this.websocket.onopen=function(){d.onOpen(),d.socket.setBuffer(!1)},this.websocket.onmessage=function(a){d.onData(a.data)},this.websocket.onclose=function(){d.onClose(),d.socket.setBuffer(!0)},this.websocket.onerror=function(a){d.onError(a)},this},b.util.ua.iDevice?d.prototype.send=function(a){var b=this;return setTimeout(function(){b.websocket.send(a)},0),this}:d.prototype.send=function(a){return this.websocket.send(a),this},d.prototype.payload=function(a){for(var b=0,c=a.length;b<c;b++)this.packet(a[b]);return this},d.prototype.close=function(){return this.websocket.close(),this},d.prototype.onError=function(a){this.socket.onError(a)},d.prototype.scheme=function(){return this.socket.options.secure?"wss":"ws"},d.check=function(){return"WebSocket"in c&&!("__addTask"in WebSocket)||"MozWebSocket"in c},d.xdomainCheck=function(){return!0},b.transports.push("websocket")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(){b.Transport.websocket.apply(this,arguments)}a.flashsocket=c,b.util.inherit(c,b.Transport.websocket),c.prototype.name="flashsocket",c.prototype.open=function(){var a=this,c=arguments;return WebSocket.__addTask(function(){b.Transport.websocket.prototype.open.apply(a,c)}),this},c.prototype.send=function(){var a=this,c=arguments;return WebSocket.__addTask(function(){b.Transport.websocket.prototype.send.apply(a,c)}),this},c.prototype.close=function(){return WebSocket.__tasks.length=0,b.Transport.websocket.prototype.close.call(this),this},c.prototype.ready=function(a,d){function e(){var b=a.options,e=b["flash policy port"],g=["http"+(b.secure?"s":"")+":/",b.host+":"+b.port,b.resource,"static/flashsocket","WebSocketMain"+(a.isXDomain()?"Insecure":"")+".swf"];c.loaded||(typeof WEB_SOCKET_SWF_LOCATION=="undefined"&&(WEB_SOCKET_SWF_LOCATION=g.join("/")),e!==843&&WebSocket.loadFlashPolicyFile("xmlsocket://"+b.host+":"+e),WebSocket.__initialize(),c.loaded=!0),d.call(f)}var f=this;if(document.body)return e();b.util.load(e)},c.check=function(){return typeof WebSocket!="undefined"&&"__initialize"in WebSocket&&!!swfobject?swfobject.getFlashPlayerVersion().major>=10:!1},c.xdomainCheck=function(){return!0},typeof window!="undefined"&&(WEB_SOCKET_DISABLE_AUTO_INITIALIZATION=!0),b.transports.push("flashsocket")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports);if("undefined"!=typeof window)var swfobject=function(){function A(){if(t)return;try{var a=i.getElementsByTagName("body")[0].appendChild(Q("span"));a.parentNode.removeChild(a)}catch(b){return}t=!0;var c=l.length;for(var d=0;d<c;d++)l[d]()}function B(a){t?a():l[l.length]=a}function C(b){if(typeof h.addEventListener!=a)h.addEventListener("load",b,!1);else if(typeof i.addEventListener!=a)i.addEventListener("load",b,!1);else if(typeof h.attachEvent!=a)R(h,"onload",b);else if(typeof h.onload=="function"){var c=h.onload;h.onload=function(){c(),b()}}else h.onload=b}function D(){k?E():F()}function E(){var c=i.getElementsByTagName("body")[0],d=Q(b);d.setAttribute("type",e);var f=c.appendChild(d);if(f){var g=0;(function(){if(typeof f.GetVariable!=a){var b=f.GetVariable("$version");b&&(b=b.split(" ")[1].split(","),y.pv=[parseInt(b[0],10),parseInt(b[1],10),parseInt(b[2],10)])}else if(g<10){g++,setTimeout(arguments.callee,10);return}c.removeChild(d),f=null,F()})()}else F()}function F(){var b=m.length;if(b>0)for(var c=0;c<b;c++){var d=m[c].id,e=m[c].callbackFn,f={success:!1,id:d};if(y.pv[0]>0){var g=P(d);if(g)if(S(m[c].swfVersion)&&!(y.wk&&y.wk<312))U(d,!0),e&&(f.success=!0,f.ref=G(d),e(f));else if(m[c].expressInstall&&H()){var h={};h.data=m[c].expressInstall,h.width=g.getAttribute("width")||"0",h.height=g.getAttribute("height")||"0",g.getAttribute("class")&&(h.styleclass=g.getAttribute("class")),g.getAttribute("align")&&(h.align=g.getAttribute("align"));var i={},j=g.getElementsByTagName("param"),k=j.length;for(var l=0;l<k;l++)j[l].getAttribute("name").toLowerCase()!="movie"&&(i[j[l].getAttribute("name")]=j[l].getAttribute("value"));I(h,i,d,e)}else J(g),e&&e(f)}else{U(d,!0);if(e){var n=G(d);n&&typeof n.SetVariable!=a&&(f.success=!0,f.ref=n),e(f)}}}}function G(c){var d=null,e=P(c);if(e&&e.nodeName=="OBJECT")if(typeof e.SetVariable!=a)d=e;else{var f=e.getElementsByTagName(b)[0];f&&(d=f)}return d}function H(){return!u&&S("6.0.65")&&(y.win||y.mac)&&!(y.wk&&y.wk<312)}function I(b,c,d,e){u=!0,r=e||null,s={success:!1,id:d};var g=P(d);if(g){g.nodeName=="OBJECT"?(p=K(g),q=null):(p=g,q=d),b.id=f;if(typeof b.width==a||!/%$/.test(b.width)&&parseInt(b.width,10)<310)b.width="310";if(typeof b.height==a||!/%$/.test(b.height)&&parseInt(b.height,10)<137)b.height="137";i.title=i.title.slice(0,47)+" - Flash Player Installation";var j=y.ie&&y.win?["Active"].concat("").join("X"):"PlugIn",k="MMredirectURL="+h.location.toString().replace(/&/g,"%26")+"&MMplayerType="+j+"&MMdoctitle="+i.title;typeof c.flashvars!=a?c.flashvars+="&"+k:c.flashvars=k;if(y.ie&&y.win&&g.readyState!=4){var l=Q("div");d+="SWFObjectNew",l.setAttribute("id",d),g.parentNode.insertBefore(l,g),g.style.display="none",function(){g.readyState==4?g.parentNode.removeChild(g):setTimeout(arguments.callee,10)}()}L(b,c,d)}}function J(a){if(y.ie&&y.win&&a.readyState!=4){var b=Q("div");a.parentNode.insertBefore(b,a),b.parentNode.replaceChild(K(a),b),a.style.display="none",function(){a.readyState==4?a.parentNode.removeChild(a):setTimeout(arguments.callee,10)}()}else a.parentNode.replaceChild(K(a),a)}function K(a){var c=Q("div");if(y.win&&y.ie)c.innerHTML=a.innerHTML;else{var d=a.getElementsByTagName(b)[0];if(d){var e=d.childNodes;if(e){var f=e.length;for(var g=0;g<f;g++)(e[g].nodeType!=1||e[g].nodeName!="PARAM")&&e[g].nodeType!=8&&c.appendChild(e[g].cloneNode(!0))}}}return c}function L(c,d,f){var g,h=P(f);if(y.wk&&y.wk<312)return g;if(h){typeof c.id==a&&(c.id=f);if(y.ie&&y.win){var i="";for(var j in c)c[j]!=Object.prototype[j]&&(j.toLowerCase()=="data"?d.movie=c[j]:j.toLowerCase()=="styleclass"?i+=' class="'+c[j]+'"':j.toLowerCase()!="classid"&&(i+=" "+j+'="'+c[j]+'"'));var k="";for(var l in d)d[l]!=Object.prototype[l]&&(k+='<param name="'+l+'" value="'+d[l]+'" />');h.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+i+">"+k+"</object>",n[n.length]=c.id,g=P(c.id)}else{var m=Q(b);m.setAttribute("type",e);for(var o in c)c[o]!=Object.prototype[o]&&(o.toLowerCase()=="styleclass"?m.setAttribute("class",c[o]):o.toLowerCase()!="classid"&&m.setAttribute(o,c[o]));for(var p in d)d[p]!=Object.prototype[p]&&p.toLowerCase()!="movie"&&M(m,p,d[p]);h.parentNode.replaceChild(m,h),g=m}}return g}function M(a,b,c){var d=Q("param");d.setAttribute("name",b),d.setAttribute("value",c),a.appendChild(d)}function N(a){var b=P(a);b&&b.nodeName=="OBJECT"&&(y.ie&&y.win?(b.style.display="none",function(){b.readyState==4?O(a):setTimeout(arguments.callee,10)}()):b.parentNode.removeChild(b))}function O(a){var b=P(a);if(b){for(var c in b)typeof b[c]=="function"&&(b[c]=null);b.parentNode.removeChild(b)}}function P(a){var b=null;try{b=i.getElementById(a)}catch(c){}return b}function Q(a){return i.createElement(a)}function R(a,b,c){a.attachEvent(b,c),o[o.length]=[a,b,c]}function S(a){var b=y.pv,c=a.split(".");return c[0]=parseInt(c[0],10),c[1]=parseInt(c[1],10)||0,c[2]=parseInt(c[2],10)||0,b[0]>c[0]||b[0]==c[0]&&b[1]>c[1]||b[0]==c[0]&&b[1]==c[1]&&b[2]>=c[2]?!0:!1}function T(c,d,e,f){if(y.ie&&y.mac)return;var g=i.getElementsByTagName("head")[0];if(!g)return;var h=e&&typeof e=="string"?e:"screen";f&&(v=null,w=null);if(!v||w!=h){var j=Q("style");j.setAttribute("type","text/css"),j.setAttribute("media",h),v=g.appendChild(j),y.ie&&y.win&&typeof i.styleSheets!=a&&i.styleSheets.length>0&&(v=i.styleSheets[i.styleSheets.length-1]),w=h}y.ie&&y.win?v&&typeof v.addRule==b&&v.addRule(c,d):v&&typeof i.createTextNode!=a&&v.appendChild(i.createTextNode(c+" {"+d+"}"))}function U(a,b){if(!x)return;var c=b?"visible":"hidden";t&&P(a)?P(a).style.visibility=c:T("#"+a,"visibility:"+c)}function V(b){var c=/[\\\"<>\.;]/,d=c.exec(b)!=null;return d&&typeof encodeURIComponent!=a?encodeURIComponent(b):b}var a="undefined",b="object",c="Shockwave Flash",d="ShockwaveFlash.ShockwaveFlash",e="application/x-shockwave-flash",f="SWFObjectExprInst",g="onreadystatechange",h=window,i=document,j=navigator,k=!1,l=[D],m=[],n=[],o=[],p,q,r,s,t=!1,u=!1,v,w,x=!0,y=function(){var f=typeof i.getElementById!=a&&typeof i.getElementsByTagName!=a&&typeof i.createElement!=a,g=j.userAgent.toLowerCase(),l=j.platform.toLowerCase(),m=l?/win/.test(l):/win/.test(g),n=l?/mac/.test(l):/mac/.test(g),o=/webkit/.test(g)?parseFloat(g.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):!1,p=!1,q=[0,0,0],r=null;if(typeof j.plugins!=a&&typeof j.plugins[c]==b)r=j.plugins[c].description,r&&(typeof j.mimeTypes==a||!j.mimeTypes[e]||!!j.mimeTypes[e].enabledPlugin)&&(k=!0,p=!1,r=r.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),q[0]=parseInt(r.replace(/^(.*)\..*$/,"$1"),10),q[1]=parseInt(r.replace(/^.*\.(.*)\s.*$/,"$1"),10),q[2]=/[a-zA-Z]/.test(r)?parseInt(r.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0);else if(typeof h[["Active"].concat("Object").join("X")]!=a)try{var s=new(window[["Active"].concat("Object").join("X")])(d);s&&(r=s.GetVariable("$version"),r&&(p=!0,r=r.split(" ")[1].split(","),q=[parseInt(r[0],10),parseInt(r[1],10),parseInt(r[2],10)]))}catch(t){}return{w3:f,pv:q,wk:o,ie:p,win:m,mac:n}}(),z=function(){if(!y.w3)return;(typeof i.readyState!=a&&i.readyState=="complete"||typeof i.readyState==a&&(i.getElementsByTagName("body")[0]||i.body))&&A(),t||(typeof i.addEventListener!=a&&i.addEventListener("DOMContentLoaded",A,!1),y.ie&&y.win&&(i.attachEvent(g,function(){i.readyState=="complete"&&(i.detachEvent(g,arguments.callee),A())}),h==top&&function(){if(t)return;try{i.documentElement.doScroll("left")}catch(a){setTimeout(arguments.callee,0);return}A()}()),y.wk&&function(){if(t)return;if(!/loaded|complete/.test(i.readyState)){setTimeout(arguments.callee,0);return}A()}(),C(A))}(),W=function(){y.ie&&y.win&&window.attachEvent("onunload",function(){var a=o.length;for(var b=0;b<a;b++)o[b][0].detachEvent(o[b][1],o[b][2]);var c=n.length;for(var d=0;d<c;d++)N(n[d]);for(var e in y)y[e]=null;y=null;for(var f in swfobject)swfobject[f]=null;swfobject=null})}();return{registerObject:function(a,b,c,d){if(y.w3&&a&&b){var e={};e.id=a,e.swfVersion=b,e.expressInstall=c,e.callbackFn=d,m[m.length]=e,U(a,!1)}else d&&d({success:!1,id:a})},getObjectById:function(a){if(y.w3)return G(a)},embedSWF:function(c,d,e,f,g,h,i,j,k,l){var m={success:!1,id:d};y.w3&&!(y.wk&&y.wk<312)&&c&&d&&e&&f&&g?(U(d,!1),B(function(){e+="",f+="";var n={};if(k&&typeof k===b)for(var o in k)n[o]=k[o];n.data=c,n.width=e,n.height=f;var p={};if(j&&typeof j===b)for(var q in j)p[q]=j[q];if(i&&typeof i===b)for(var r in i)typeof p.flashvars!=a?p.flashvars+="&"+r+"="+i[r]:p.flashvars=r+"="+i[r];if(S(g)){var s=L(n,p,d);n.id==d&&U(d,!0),m.success=!0,m.ref=s}else{if(h&&H()){n.data=h,I(n,p,d,l);return}U(d,!0)}l&&l(m)})):l&&l(m)},switchOffAutoHideShow:function(){x=!1},ua:y,getFlashPlayerVersion:function(){return{major:y.pv[0],minor:y.pv[1],release:y.pv[2]}},hasFlashPlayerVersion:S,createSWF:function(a,b,c){return y.w3?L(a,b,c):undefined},showExpressInstall:function(a,b,c,d){y.w3&&H()&&I(a,b,c,d)},removeSWF:function(a){y.w3&&N(a)},createCSS:function(a,b,c,d){y.w3&&T(a,b,c,d)},addDomLoadEvent:B,addLoadEvent:C,getQueryParamValue:function(a){var b=i.location.search||i.location.hash;if(b){/\?/.test(b)&&(b=b.split("?")[1]);if(a==null)return V(b);var c=b.split("&");for(var d=0;d<c.length;d++)if(c[d].substring(0,c[d].indexOf("="))==a)return V(c[d].substring(c[d].indexOf("=")+1))}return""},expressInstallCallback:function(){if(u){var a=P(f);a&&p&&(a.parentNode.replaceChild(p,a),q&&(U(q,!0),y.ie&&y.win&&(p.style.display="block")),r&&r(s)),u=!1}}}}();(function(){if("undefined"==typeof window||window.WebSocket)return;var a=window.console;if(!a||!a.log||!a.error)a={log:function(){},error:function(){}};if(!swfobject.hasFlashPlayerVersion("10.0.0")){a.error("Flash Player >= 10.0.0 is required.");return}location.protocol=="file:"&&a.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."),WebSocket=function(a,b,c,d,e){var f=this;f.__id=WebSocket.__nextId++,WebSocket.__instances[f.__id]=f,f.readyState=WebSocket.CONNECTING,f.bufferedAmount=0,f.__events={},b?typeof b=="string"&&(b=[b]):b=[],setTimeout(function(){WebSocket.__addTask(function(){WebSocket.__flash.create(f.__id,a,b,c||null,d||0,e||null)})},0)},WebSocket.prototype.send=function(a){if(this.readyState==WebSocket.CONNECTING)throw"INVALID_STATE_ERR: Web Socket connection has not been established";var b=WebSocket.__flash.send(this.__id,encodeURIComponent(a));return b<0?!0:(this.bufferedAmount+=b,!1)},WebSocket.prototype.close=function(){if(this.readyState==WebSocket.CLOSED||this.readyState==WebSocket.CLOSING)return;this.readyState=WebSocket.CLOSING,WebSocket.__flash.close(this.__id)},WebSocket.prototype.addEventListener=function(a,b,c){a in this.__events||(this.__events[a]=[]),this.__events[a].push(b)},WebSocket.prototype.removeEventListener=function(a,b,c){if(!(a in this.__events))return;var d=this.__events[a];for(var e=d.length-1;e>=0;--e)if(d[e]===b){d.splice(e,1);break}},WebSocket.prototype.dispatchEvent=function(a){var b=this.__events[a.type]||[];for(var c=0;c<b.length;++c)b[c](a);var d=this["on"+a.type];d&&d(a)},WebSocket.prototype.__handleEvent=function(a){"readyState"in a&&(this.readyState=a.readyState),"protocol"in a&&(this.protocol=a.protocol);var b;if(a.type=="open"||a.type=="error")b=this.__createSimpleEvent(a.type);else if(a.type=="close")b=this.__createSimpleEvent("close");else{if(a.type!="message")throw"unknown event type: "+a.type;var c=decodeURIComponent(a.message);b=this.__createMessageEvent("message",c)}this.dispatchEvent(b)},WebSocket.prototype.__createSimpleEvent=function(a){if(document.createEvent&&window.Event){var b=document.createEvent("Event");return b.initEvent(a,!1,!1),b}return{type:a,bubbles:!1,cancelable:!1}},WebSocket.prototype.__createMessageEvent=function(a,b){if(document.createEvent&&window.MessageEvent&&!window.opera){var c=document.createEvent("MessageEvent");return c.initMessageEvent("message",!1,!1,b,null,null,window,null),c}return{type:a,data:b,bubbles:!1,cancelable:!1}},WebSocket.CONNECTING=0,WebSocket.OPEN=1,WebSocket.CLOSING=2,WebSocket.CLOSED=3,WebSocket.__flash=null,WebSocket.__instances={},WebSocket.__tasks=[],WebSocket.__nextId=0,WebSocket.loadFlashPolicyFile=function(a){WebSocket.__addTask(function(){WebSocket.__flash.loadManualPolicyFile(a)})},WebSocket.__initialize=function(){if(WebSocket.__flash)return;WebSocket.__swfLocation&&(window.WEB_SOCKET_SWF_LOCATION=WebSocket.__swfLocation);if(!window.WEB_SOCKET_SWF_LOCATION){a.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");return}var b=document.createElement("div");b.id="webSocketContainer",b.style.position="absolute",WebSocket.__isFlashLite()?(b.style.left="0px",b.style.top="0px"):(b.style.left="-100px",b.style.top="-100px");var c=document.createElement("div");c.id="webSocketFlash",b.appendChild(c),document.body.appendChild(b),swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION,"webSocketFlash","1","1","10.0.0",null,null,{hasPriority:!0,swliveconnect:!0,allowScriptAccess:"always"},null,function(b){b.success||a.error("[WebSocket] swfobject.embedSWF failed")})},WebSocket.__onFlashInitialized=function(){setTimeout(function(){WebSocket.__flash=document.getElementById("webSocketFlash"),WebSocket.__flash.setCallerUrl(location.href),WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);for(var a=0;a<WebSocket.__tasks.length;++a)WebSocket.__tasks[a]();WebSocket.__tasks=[]},0)},WebSocket.__onFlashEvent=function(){return setTimeout(function(){try{var b=WebSocket.__flash.receiveEvents();for(var c=0;c<b.length;++c)WebSocket.__instances[b[c].webSocketId].__handleEvent(b[c])}catch(d){a.error(d)}},0),!0},WebSocket.__log=function(b){a.log(decodeURIComponent(b))},WebSocket.__error=function(b){a.error(decodeURIComponent(b))},WebSocket.__addTask=function(a){WebSocket.__flash?a():WebSocket.__tasks.push(a)},WebSocket.__isFlashLite=function(){if(!window.navigator||!window.navigator.mimeTypes)return!1;var a=window.navigator.mimeTypes["application/x-shockwave-flash"];return!a||!a.enabledPlugin||!a.enabledPlugin.filename?!1:a.enabledPlugin.filename.match(/flashlite/i)?!0:!1},window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION||(window.addEventListener?window.addEventListener("load",function(){WebSocket.__initialize()},!1):window.attachEvent("onload",function(){WebSocket.__initialize()}))})(),function(a,b,c){function d(a){if(!a)return;b.Transport.apply(this,arguments),this.sendBuffer=[]}function e(){}a.XHR=d,b.util.inherit(d,b.Transport),d.prototype.open=function(){return this.socket.setBuffer(!1),this.onOpen(),this.get(),this.setCloseTimeout(),this},d.prototype.payload=function(a){var c=[];for(var d=0,e=a.length;d<e;d++)c.push(b.parser.encodePacket(a[d]));this.send(b.parser.encodePayload(c))},d.prototype.send=function(a){return this.post(a),this},d.prototype.post=function(a){function d(){this.readyState==4&&(this.onreadystatechange=e,b.posting=!1,this.status==200?b.socket.setBuffer(!1):b.onClose())}function f(){this.onload=e,b.socket.setBuffer(!1)}var b=this;this.socket.setBuffer(!0),this.sendXHR=this.request("POST"),c.XDomainRequest&&this.sendXHR instanceof XDomainRequest?this.sendXHR.onload=this.sendXHR.onerror=f:this.sendXHR.onreadystatechange=d,this.sendXHR.send(a)},d.prototype.close=function(){return this.onClose(),this},d.prototype.request=function(a){var c=b.util.request(this.socket.isXDomain()),d=b.util.query(this.socket.options.query,"t="+ +(new Date));c.open(a||"GET",this.prepareUrl()+d,!0);if(a=="POST")try{c.setRequestHeader?c.setRequestHeader("Content-type","text/plain;charset=UTF-8"):c.contentType="text/plain"}catch(e){}return c},d.prototype.scheme=function(){return this.socket.options.secure?"https":"http"},d.check=function(a,d){try{var e=b.util.request(d),f=c.XDomainRequest&&e instanceof XDomainRequest,g=a&&a.options&&a.options.secure?"https:":"http:",h=c.location&&g!=c.location.protocol;if(e&&(!f||!h))return!0}catch(i){}return!1},d.xdomainCheck=function(a){return d.check(a,!0)}}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b){function c(a){b.Transport.XHR.apply(this,arguments)}a.htmlfile=c,b.util.inherit(c,b.Transport.XHR),c.prototype.name="htmlfile",c.prototype.get=function(){this.doc=new(window[["Active"].concat("Object").join("X")])("htmlfile"),this.doc.open(),this.doc.write("<html></html>"),this.doc.close(),this.doc.parentWindow.s=this;var a=this.doc.createElement("div");a.className="socketio",this.doc.body.appendChild(a),this.iframe=this.doc.createElement("iframe"),a.appendChild(this.iframe);var c=this,d=b.util.query(this.socket.options.query,"t="+ +(new Date));this.iframe.src=this.prepareUrl()+d,b.util.on(window,"unload",function(){c.destroy()})},c.prototype._=function(a,b){a=a.replace(/\\\//g,"/"),this.onData(a);try{var c=b.getElementsByTagName("script")[0];c.parentNode.removeChild(c)}catch(d){}},c.prototype.destroy=function(){if(this.iframe){try{this.iframe.src="about:blank"}catch(a){}this.doc=null,this.iframe.parentNode.removeChild(this.iframe),this.iframe=null,CollectGarbage()}},c.prototype.close=function(){return this.destroy(),b.Transport.XHR.prototype.close.call(this)},c.check=function(a){if(typeof window!="undefined"&&["Active"].concat("Object").join("X")in window)try{var c=new(window[["Active"].concat("Object").join("X")])("htmlfile");return c&&b.Transport.XHR.check(a)}catch(d){}return!1},c.xdomainCheck=function(){return!1},b.transports.push("htmlfile")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports),function(a,b,c){function d(){b.Transport.XHR.apply(this,arguments)}function e(){}a["xhr-polling"]=d,b.util.inherit(d,b.Transport.XHR),b.util.merge(d,b.Transport.XHR),d.prototype.name="xhr-polling",d.prototype.heartbeats=function(){return!1},d.prototype.open=function(){var a=this;return b.Transport.XHR.prototype.open.call(a),!1},d.prototype.get=function(){function b(){this.readyState==4&&(this.onreadystatechange=e,this.status==200?(a.onData(this.responseText),a.get()):a.onClose())}function d(){this.onload=e,this.onerror=e,a.retryCounter=1,a.onData(this.responseText),a.get()}function f(){a.retryCounter++,!a.retryCounter||a.retryCounter>3?a.onClose():a.get()}if(!this.isOpen)return;var a=this;this.xhr=this.request(),c.XDomainRequest&&this.xhr instanceof XDomainRequest?(this.xhr.onload=d,this.xhr.onerror=f):this.xhr.onreadystatechange=b,this.xhr.send(null)},d.prototype.onClose=function(){b.Transport.XHR.prototype.onClose.call(this);if(this.xhr){this.xhr.onreadystatechange=this.xhr.onload=this.xhr.onerror=e;try{this.xhr.abort()}catch(a){}this.xhr=null}},d.prototype.ready=function(a,c){var d=this;b.util.defer(function(){c.call(d)})},b.transports.push("xhr-polling")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),function(a,b,c){function e(a){b.Transport["xhr-polling"].apply(this,arguments),this.index=b.j.length;var c=this;b.j.push(function(a){c._(a)})}var d=c.document&&"MozAppearance"in c.document.documentElement.style;a["jsonp-polling"]=e,b.util.inherit(e,b.Transport["xhr-polling"]),e.prototype.name="jsonp-polling",e.prototype.post=function(a){function i(){j(),c.socket.setBuffer(!1)}function j(){c.iframe&&c.form.removeChild(c.iframe);try{h=document.createElement('<iframe name="'+c.iframeId+'">')}catch(a){h=document.createElement("iframe"),h.name=c.iframeId}h.id=c.iframeId,c.form.appendChild(h),c.iframe=h}var c=this,d=b.util.query(this.socket.options.query,"t="+ +(new Date)+"&i="+this.index);if(!this.form){var e=document.createElement("form"),f=document.createElement("textarea"),g=this.iframeId="socketio_iframe_"+this.index,h;e.className="socketio",e.style.position="absolute",e.style.top="0px",e.style.left="0px",e.style.display="none",e.target=g,e.method="POST",e.setAttribute("accept-charset","utf-8"),f.name="d",e.appendChild(f),document.body.appendChild(e),this.form=e,this.area=f}this.form.action=this.prepareUrl()+d,j(),this.area.value=b.JSON.stringify(a);try{this.form.submit()}catch(k){}this.iframe.attachEvent?h.onreadystatechange=function(){c.iframe.readyState=="complete"&&i()}:this.iframe.onload=i,this.socket.setBuffer(!0)},e.prototype.get=function(){var a=this,c=document.createElement("script"),e=b.util.query(this.socket.options.query,"t="+ +(new Date)+"&i="+this.index);this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),c.async=!0,c.src=this.prepareUrl()+e,c.onerror=function(){a.onClose()};var f=document.getElementsByTagName("script")[0];f.parentNode.insertBefore(c,f),this.script=c,d&&setTimeout(function(){var a=document.createElement("iframe");document.body.appendChild(a),document.body.removeChild(a)},100)},e.prototype._=function(a){return this.onData(a),this.isOpen&&this.get(),this},e.prototype.ready=function(a,c){var e=this;if(!d)return c.call(this);b.util.load(function(){c.call(e)})},e.check=function(){return"document"in c},e.xdomainCheck=function(){return!0},b.transports.push("jsonp-polling")}("undefined"!=typeof io?io.Transport:module.exports,"undefined"!=typeof io?io:module.parent.exports,this),typeof define=="function"&&define.amd&&define([],function(){return io})})()

'use strict';

/**
 * @ngdoc overview
 * @module angularSails
 * @name angularSails
 *
 * @description angularSails v0.10.0
 *
 **/

(function(angular,io){



var $$NgSailsProvide;

angular.module('angularSails',[],function($provide){

    $$NgSailsProvide = $provide;

}).provider('$sails',function NgSailsProvider(){


        function NgSails(Injector){
            
            var sails = this;

           
            return sails;
        }

        NgSails.$inject = ['$injector'];
        NgSails.$get = NgSails;

        NgSails.config = {
            models: {},

        };



        //register a model
        NgSails.model = function(identity,modelConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                var Model = $injector.get('$sailsModel');

                return Model(identity,modelConfig);

            }])

        };

        //register a model
        NgSails.connection = function(identity,connectionConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                return modelConfig;

            }])

        };

        //register a model
        NgSails.route = function(identity,routeConfig){

            $$NgSailsProvide.factory(identity,['$injector',function($injector){

                return modelConfig;

            }])

        };
        return NgSails;

});



angular.module('angularSails').factory('SailsCollection',function(){

})
'use strict';
angular.module('angularSails').factory('$sailsSDKConfig',function(){

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
    return SDK_INFO;
});

'use strict';
/*
* //Forked from:
*
* @license
* angular-socket-io v0.6.0
* (c) 2014 Brian Ford http://briantford.com
* License: MIT
*
*
*
*/

angular.module('angularSails')


.provider('$sailsSocketFactory', function () {


    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:';

    // expose to provider
    this.$get = ['$rootScope', '$timeout', '$sailsSDKConfig',function ($rootScope, $timeout,$sailsSDKConfig) {

        var asyncAngularify = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };

        return function socketFactory (options) {
            options = options || {};
            var socket = options.ioSocket || io.connect(options.url || '/',{ query : $sailsSDKConfig.versionString });
            var prefix = options.prefix || defaultPrefix;
            var defaultScope = options.scope || $rootScope;

            var addListener = function (eventName, callback) {
                socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
            };

            var addOnceListener = function (eventName, callback) {
                socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
            };

            var wrappedSocket = {
                on: addListener,
                addListener: addListener,
                once: addOnceListener,



                emit: function (eventName, data, callback) {
                    var lastIndex = arguments.length - 1;
                    callback = arguments[lastIndex];
                    if(typeof callback === 'function') {
                        callback = asyncAngularify(socket, callback);
                        arguments[lastIndex] = callback;
                    }
                    return socket.emit.apply(socket, arguments);
                },


                removeListener: function (ev, fn) {
                    if (fn && fn.__ng) {
                        arguments[1] = fn.__ng;
                    }
                    return socket.removeListener.apply(socket, arguments);
                },

                removeAllListeners: function() {
                    return socket.removeAllListeners.apply(socket, arguments);
                },

                disconnect: function (close) {
                    return socket.disconnect(close);
                },

                // when socket.on('someEvent', fn (data) { ... }),
                // call scope.$broadcast('someEvent', data)
                forward: function (events, scope) {
                    if (events instanceof Array === false) {
                        events = [events];
                    }
                    if (!scope) {
                        scope = defaultScope;
                    }
                    events.forEach(function (eventName) {
                        var prefixedEvent = prefix + eventName;
                        var forwardBroadcast = asyncAngularify(socket, function (data) {
                            scope.$broadcast(prefixedEvent, data);
                        });
                        scope.$on('$destroy', function () {
                            socket.removeListener(eventName, forwardBroadcast);
                        });
                        socket.on(eventName, forwardBroadcast);
                    });
                }
            };

            return wrappedSocket;
        };
    }];
});


/**
* @ngdoc overview
* @name angularSails.resource
* @description
*
* # ngResource
*
* The `ngResource` module provides interaction support with RESTful services
* via the $resource service.
*
*/

/**
* @ngdoc service
* @name $SailsModel
*
*
* # angularSails.resource
*
* The `angularSails.resource` module provides a client-side model layer for use with a SailsJS API.
*
*
*/

angular.module('angularSails').

provider('$sailsModel', function () {
    
    var provider = this;







    this.config = {
        basePath: '/',
        models: {
            attributes: {
                id: {
                    primaryKey: true
                },
                createdAt: {
                    type: 'date'
                },
                updatedAt: {
                    type: 'date'
                }
            }
        }
    }
    this.defaults = {
        // Strip slashes by default
        stripTrailingSlashes: true,

        // Default actions configuration
        blueprints: {
            'find': {method: 'GET', isArray: true},
            'findOne': {method: 'GET'},
            'update': {method: 'PUT'},
            'create': {method: 'POST'},
            'destroy': {method: 'DELETE'},
            'stream': {method: 'GET', isArray: true}
        },
    };


    /**
    * Create a shallow copy of an object and clear other fields from the destination
    */
    function shallowClearAndCopy(src, dst) {
        dst = dst || {};

        angular.forEach(dst, function(value, key){
            delete dst[key];
        });

        for (var key in src) {
            if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                dst[key] = src[key];
            }
        }

        return dst;
    }

    // Helper functions and regex to lookup a dotted path on an object
    // stopping at undefined/null.  The path must be composed of ASCII
    // identifiers (just like $parse)
    var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;

    function isValidDottedPath(path) {
        return (path != null && path !== '' && path !== 'hasOwnProperty' &&
        MEMBER_NAME_REGEX.test('.' + path));
    }

    function lookupDottedPath(obj, path) {
        if (!isValidDottedPath(path)) {
            throw $SailsModelMinErr('badmember', 'Dotted member path "@{0}" is invalid.', 'bad path');
        }
        var keys = path.split('.');
        for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
            var key = keys[i];
            obj = (obj !== null) ? obj[key] : undefined;
        }
        return obj;
    }



    this.$get = ['$q', '$cacheFactory','$injector','$sailsRoute',function ($q, $cacheFactory,$injector,Route) {

        var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction,
        isString = angular.isString,
        isObject = angular.isObject;

        var $SailsModelMinErr = angular.$$minErr('$SailsModel');

        function resourceFactory(model, controller, options) {


            var connection;

            if(!model.connection && !model.provider){

                connection = $injector.get('$sailsSocket');

            }
            else if(model.connection == '$http'){
                connection = $injector.get('$http');
            }

            if(!model){
                throw new Error('$SailsModel :: no model config declared!!!')
            }

            if(isString(model)){
                model = {identity: model};
            }

            if(!model.identity){
                throw new Error('$SailsModel :: model must have an identity defined!')
            }

            model.identity = model.identity.toLowerCase();

            var paramDefaults = {id : '@id'}

            var url = provider.config.basePath + model.identity.toLowerCase() + '/:id'

            var route = new Route(url, {stripTrailingSlashes: true});

            var actions = extend({}, provider.defaults.blueprints,model);

            
            function extractParams(data, actionParams) {
                var ids = {};
                actionParams = extend({}, paramDefaults, actionParams);
                forEach(actionParams, function (value, key) {
                    if (isFunction(value)) { value = value(); }
                        ids[key] = value && value.charAt && value.charAt(0) == '@' ?
                        lookupDottedPath(data, value.substr(1)) : value;
                    });
                    return ids;
            }

            function defaultResponseInterceptor(response) {
                return response.resource;
            }


            /**
            * SailsModel
            */
           
            function SailsModel(data) {

                var rec = this;

                forEach(data,function(value,key){

                    rec[key] = value;

                })

                

            }

            SailsModel.init = function(data){
                var rec;
                if(this.cache.get(data.id)){
                    rec = this.cache.get(data.id);
                    angular.extend(rec,data);
                }
                else{
                    rec = new SailsModel(data);
                    this.cache.put(rec.id,rec);
                }
                return rec;
            }

            SailsModel.cache = $cacheFactory('SailsModel_' + model.identity,{capacity: 100000});

            SailsModel.connection = connection;

            SailsModel.pubHandlers = {};

        

            forEach(actions, function (action, name) {
              var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

              SailsModel[name] = function (a1, a2, a3, a4) {

                var resource = this;
                var params = {}, data;

                if(!hasBody){
                    params = a1;
                }

                else{
                    data = a1;
                }


                var isInstanceCall = this instanceof SailsModel;
                var value = isInstanceCall ? data : (action.isArray ? [] : new SailsModel(data));
                var httpConfig = {};
                var responseInterceptor = action.interceptor && action.interceptor.response ||
                  defaultResponseInterceptor;
                var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
                  undefined;

                forEach(action, function (value, key) {
                  if (key != 'params' && key != 'isArray' && key != 'interceptor') {
                    httpConfig[key] = copy(value);
                  }
                });

                if (hasBody) httpConfig.data = data;
                route.setUrlParams(httpConfig,
                  extend({}, extractParams(data, action.params || {}), params),
                  action.url);

                var request = resource.connection(httpConfig).then(function (response) {
                  var data = response.data;


                  if (data) {
                    // Need to convert action.isArray to boolean in case it is undefined
                    // jshint -W018
                    if (angular.isArray(data) !== (!!action.isArray)) {
                      throw $SailsModelMinErr('badcfg',
                          'Error in resource configuration. Expected ' +
                          'response to contain an {0} but got an {1}','test');
                    }
                    // jshint +W018
                    if (action.isArray) {
                      value.length = 0;
                      forEach(data, function (item) {
                        if (typeof item === "object") {
                          value.push(SailsModel.init(item));
                        } else {
                          // Valid JSON values may be string literals, and these should not be converted
                          // into objects. These items will not have access to the Resource prototype
                          // methods, but unfortunately there
                          value.push(item);
                        }
                      });
                    } else {
                      SailsModel.init(data);

                    }

                    return value;
                  }



              }, function (error) {

                  return $q.reject(error);
                });

                return request;

              };



            });

            SailsModel._streams = [];

            SailsModel.stream = function(where){

                var stream = new Array();

                stream.add = function(rec){
                    if(!stream.indexOf(rec) > -1){
                        stream.push(rec);
                    }
                }

                stream.bindScope = function(scope){
                    scope.$on('$destroy',function(){
                        SailsModel._streams.splice(SailsModel._streams.indexOf(stream),1);
                    })
                }

                SailsModel._streams.push(stream);

                SailsModel.find(where).then(function(records){
                    forEach(records,stream.add);
                });

                return stream;
            }

            SailsModel.didReceivePublishMessage = function(pushMessage){
                switch(pushMessage.verb){
                    case 'created':
                        SailsModel.didReceivePublishCreate(pushMessage);
                    break;
                    case 'updated':
                        SailsModel.didReceivePublishUpdate(pushMessage);
                    break;
                }
            }



            SailsModel.didReceivePublishCreate = function(message){
                
                if(SailsModel.cache.get(message.id)){
                    SailsModel.didReceivePublishUpdate(message);
                    return;
                };

                var rec = SailsModel.init(message.data);

                forEach(SailsModel._streams,function(stream){
                    stream.add(rec);
                })
                
            }

            SailsModel.didReceivePublishUpdate = function(message){
                var model = this;
                
                if(SailsModel.cache.get(message.id)){
                    var rec = SailsModel.cache.get(message.id);
                    angular.extend(rec,message.data);
                }
            }

            SailsModel.didReceivePublishDestroy = function(message){

                
            }

            SailsModel.didReceivePublishAdd = function(id,data){

                
            }

            SailsModel.didReceivePublishRemove = function(id,data){

                
            }

            SailsModel.prototype.destroy = function () {

            };

            SailsModel.prototype.onDataNotify = function () {

            };

            SailsModel.bind = function (additionalParamDefaults) {
                return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
            }

            connection.addListener(model.identity,SailsModel.didReceivePublishMessage.bind(SailsModel));



            return SailsModel;
        }

        return resourceFactory;
                
    }];
})

angular.module('angularSails').factory('$sailsRoute',[function(){




    /**
    * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
    * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
    * (pchar) allowed in path segments:
    *    segment       = *pchar
    *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
    *    pct-encoded   = "%" HEXDIG HEXDIG
    *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
    *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
    *                     / "*" / "+" / "," / ";" / "="
    */
    function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
    }


    /**
    * This method is intended for encoding *key* or *value* parts of query component. We need a
    * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
    * have to be encoded per http://tools.ietf.org/html/rfc3986:
    *    query       = *( pchar / "/" / "?" )
    *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
    *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
    *    pct-encoded   = "%" HEXDIG HEXDIG
    *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
    *                     / "*" / "+" / "," / ";" / "="
    */
    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function Route(template, defaults) {
        this.template = template;
        this.defaults = angular.extend({},defaults);
        this.urlParams = {};
    }

    Route.prototype = {
        setUrlParams: function (config, params, actionUrl) {

            console.log(config)
            var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal;

            var urlParams = self.urlParams = {};
            forEach(url.split(/\W/), function (param) {
                if (param === 'hasOwnProperty') {
                    throw $sailsResourceMinErr('badname', "hasOwnProperty is not a valid parameter name.",'test');
                }
                if (!(new RegExp("^\\d+$").test(param)) && param &&
                    (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
                        urlParams[param] = true;
                    }
                });
                url = url.replace(/\\:/g, ':');

                params = params || {};
                forEach(self.urlParams, function (_, urlParam) {
                    val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
                    if (angular.isDefined(val) && val !== null) {
                        encodedVal = encodeUriSegment(val);
                        url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function (match, p1) {
                            return encodedVal + p1;
                        });
                    } else {
                        url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function (match,
                            leadingSlashes, tail) {
                                if (tail.charAt(0) == '/') {
                                    return tail;
                                } else {
                                    return leadingSlashes + tail;
                                }
                            });
                        }
                    });

                    // strip trailing slashes and set the url (unless this behavior is specifically disabled)
                    if (self.defaults.stripTrailingSlashes) {
                        url = url.replace(/\/+$/, '') || '/';
                    }

                    // then replace collapse `/.` if found in the last URL path segment before the query
                    // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
                    url = url.replace(/\/\.(?=\w+($|\?))/, '.');
                    // replace escaped `/\.` with `/.`
                    config.url = url.replace(/\/\\\./, '/.');


                    // set params - delegate param encoding to $http
                    forEach(params, function (value, key) {
                        if (!self.urlParams[key]) {
                            config.params = config.params || {};
                            config.params[key] = value;
                        }
                    });
                }
            };


            return Route;


        }])

'use strict';

/* global
 angularModule: true,

*/


/**
 * @ngdoc overview
 * @module ngsails
 * @name ngsails
 *
 * @description foobar
 *
 **/





angular.module('angularSails').provider('$sailsSocket',function $sailsSocketProvider() {

    'use strict';
    // NOTE:  The usage of window and document instead of $window and $document here is
    // deliberate.  This service depends on the specific behavior of anchor nodes created by the
    // browser (resolving and parsing URLs) that is unlikely to be provided by mock objects and
    // cause us to break tests.  In addition, when the browser resolves a URL for XHR, it
    // doesn't know about mocked locations and resolves URLs to the real document - which is
    // exactly the behavior needed here.  There is little value is mocking these out for this
    // service.
    var urlParsingNode = document.createElement("a");
    var originUrl = urlResolve(window.location.href, true);

    /**
     * Chain all given functions
     *
     * This function is used for both request and response transforming
     *
     * @param {*} data Data to transform.
     * @param {function(string=)} headers Http headers getter fn.
     * @param {(Function|Array.<Function>)} fns Function or an array of functions.
     * @returns {*} Transformed data.
     */
    function transformData(data, headers, fns) {
        if (isFunction(fns))
            return fns(data, headers);

        forEach(fns, function(fn) {
            data = fn(data, headers);
        });

        return data;
    }

    function shallowCopy(src, dst) {
      if (isArray(src)) {
        dst = dst || [];

        for ( var i = 0; i < src.length; i++) {
          dst[i] = src[i];
        }
      } else if (isObject(src)) {
        dst = dst || {};

        for (var key in src) {
          if (hasOwnProperty.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
            dst[key] = src[key];
          }
        }
      }

      return dst || src;
    }


    function isSuccess(status) {
        return 200 <= status && status < 300;
    }


    /**
     * Parse headers into key value object
     *
     * @param {string} headers Raw headers as a string
     * @returns {Object} Parsed headers as key value object
     */
    function parseHeaders(headers) {
        var parsed = {}, key, val, i;

        if (!headers) return parsed;

        forEach(headers.split('\n'), function(line) {
            i = line.indexOf(':');
            key = lowercase(trim(line.substr(0, i)));
            val = trim(line.substr(i + 1));

            if (key) {
                if (parsed[key]) {
                    parsed[key] += ', ' + val;
                } else {
                    parsed[key] = val;
                }
            }
        });

        return parsed;
    }
    /**
     * Returns a function that provides access to parsed headers.
     *
     * Headers are lazy parsed when first requested.
     * @see parseHeaders
     *
     * @param {(string|Object)} headers Headers to provide access to.
     * @returns {function(string=)} Returns a getter function which if called with:
     *
     *   - if called with single an argument returns a single header value or null
     *   - if called with no arguments returns an object containing all headers.
     */
    function headersGetter(headers) {
        var headersObj = isObject(headers) ? headers : undefined;

        return function(name) {
            if (!headersObj) headersObj =  parseHeaders(headers);

            if (name) {
                return headersObj[lowercase(name)] || null;
            }

            return headersObj;
        };
    }



    var trim = (function() {
      // native trim is way faster: http://jsperf.com/angular-trim-test
      // but IE doesn't have it... :-(
      // TODO: we should move this into IE/ES5 polyfill
      if (!String.prototype.trim) {
        return function(value) {
          return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
      }
      return function(value) {
        return isString(value) ? value.trim() : value;
      };
    })();

    function urlResolve(url, base) {
        var href = url;

        if (typeof msie !== 'undefined') {
            // Normalize before parse.  Refer Implementation Notes on why this is
            // done in two steps on IE.
            urlParsingNode.setAttribute("href", href);
            href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/')
                ? urlParsingNode.pathname
                : '/' + urlParsingNode.pathname
        };
    }

    /**
     * Parse a request URL and determine whether this is a same-origin request as the application document.
     *
     * @param {string|object} requestUrl The url of the request as a string that will be resolved
     * or a parsed URL object.
     * @returns {boolean} Whether the request is for the same origin as the application document.
     */
    function urlIsSameOrigin(requestUrl) {
        var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
        return (parsed.protocol === originUrl.protocol &&
            parsed.host === originUrl.host);
    }

    function buildUrl(url, params) {
        if (!params) return url;
        var parts = [];
        angular.forEach(params, function(value, key) {
            if (value === null || angular.isUndefined(value)) return;
            if (!isArray(value)) value = [value];

            angular.forEach(value, function(v) {
                if (isObject(v)) {
                    v = toJson(v);
                }
                parts.push(encodeUriQuery(key) + '=' +
                    encodeUriQuery(v));
            });
        });
        if(parts.length > 0) {
            url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
        }
        return url;
    }
    /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
            replace(/%26/gi, '&').
            replace(/%3D/gi, '=').
            replace(/%2B/gi, '+');
    }


    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$') {
            val = undefined;
        } else if (isWindow(value)) {
            val = '$WINDOW';
        } else if (value &&  document === value) {
            val = '$DOCUMENT';
        } else if (isScope(value)) {
            val = '$SCOPE';
        }

        return val;
    }

    function forEach(obj, iterator, context) {
        var key;
        if (obj) {
            if (isFunction(obj)){
                for (key in obj) {
                    // Need to check if hasOwnProperty exists,
                    // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                        iterator.call(context, obj[key], key);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context);
            } else if (isArrayLike(obj)) {
                for (key = 0; key < obj.length; key++)
                    iterator.call(context, obj[key], key);
            } else {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key);
                    }
                }
            }
        }
        return obj;
    }

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    function forEachSorted(obj, iterator, context) {
        var keys = sortedKeys(obj);
        for ( var i = 0; i < keys.length; i++) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }


    /**
     * when using forEach the params are value, key, but it is often useful to have key, value.
     * @param {function(string, *)} iteratorFn
     * @returns {function(*, string)}
     */
    function reverseParams(iteratorFn) {
        return function(value, key) { iteratorFn(key, value); };
    }


    /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a custom
     * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
     * encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }


    function valueFn(value) {return function() {return value;};}


    function isUndefined(value){return typeof value === 'undefined';}


    function isDefined(value){return typeof value !== 'undefined';}
    function isObject(value){return value != null && typeof value === 'object';}
    function isString(value){return typeof value === 'string';}
    function isNumber(value){return typeof value === 'number';}
    function isDate(value){
        return toString.call(value) === '[object Date]';
    }
    function isFunction(value){return typeof value === 'function';}

    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }
    function isFile(obj) {
        return toString.call(obj) === '[object File]';
    }


    function isBlob(obj) {
        return toString.call(obj) === '[object Blob]';
    }


    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    function isArray(value) {
        return toString.call(value) === '[object Array]';
    }


    /**
     * @private
     * @param {*} obj
     * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
     *                   String ...)
     */
    function isArrayLike(obj) {
        if (obj == null || isWindow(obj)) {
            return false;
        }

        var length = obj.length;

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return isString(obj) || isArray(obj) || length === 0 ||
            typeof length === 'number' && length > 0 && (length - 1) in obj;
    }

    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }

    var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function mergeHeaders(config) {
        var defHeaders = defaults.headers,
            reqHeaders = extend({}, config.headers),
            defHeaderName, lowercaseDefHeaderName, reqHeaderName;

        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

        // execute if header value is function
        execHeaders(defHeaders);
        execHeaders(reqHeaders);

        // using for-in instead of forEach to avoid unecessary iteration after header has been found
        defaultHeadersIteration:
            for (defHeaderName in defHeaders) {
                lowercaseDefHeaderName = lowercase(defHeaderName);

                for (reqHeaderName in reqHeaders) {
                    if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                        continue defaultHeadersIteration;
                    }
                }

                reqHeaders[defHeaderName] = defHeaders[defHeaderName];
            }

        return reqHeaders;

        function execHeaders(headers) {
            var headerContent;

            forEach(headers, function(headerFn, header) {
                if (isFunction(headerFn)) {
                    headerContent = headerFn();
                    if (headerContent != null) {
                        headers[header] = headerContent;
                    } else {
                        delete headers[header];
                    }
                }
            });
        }
    }

    var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


    var manualLowercase = function(s) {
        /* jshint bitwise: false */
        return isString(s)
            ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
            : s;
    };
    var manualUppercase = function(s) {
        /* jshint bitwise: false */
        return isString(s)
            ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
            : s;
    };


    // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
    // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
    // with correct but slower alternatives.
    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    function toJson(obj, pretty) {
        if (typeof obj === 'undefined') return undefined;
        return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
    }



    function fromJson(json) {
        return isString(json)
            ? JSON.parse(json)
            : json;
    }

    function size(obj, ownPropsOnly) {
        var count = 0, key;

        if (isArray(obj) || isString(obj)) {
            return obj.length;
        } else if (isObject(obj)){
            for (key in obj)
                if (!ownPropsOnly || obj.hasOwnProperty(key))
                    count++;
        }

        return count;
    }


    function includes(array, obj) {
        return indexOf(array, obj) != -1;
    }

    function indexOf(array, obj) {
        if (array.indexOf) return array.indexOf(obj);

        for (var i = 0; i < array.length; i++) {
            if (obj === array[i]) return i;
        }
        return -1;
    }

    function arrayRemove(array, value) {
        var index = indexOf(array, value);
        if (index >=0)
            array.splice(index, 1);
        return value;
    }


    var JSON_START = /^\s*(\[|\{[^\{])/,
        JSON_END = /[\}\]]\s*$/,
        PROTECTION_PREFIX = /^\)\]\}',?\n/,
        CONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8'};

    var defaults = this.defaults = {
        // transform incoming response data
        transformResponse: [function(data) {
            if (angular.isString(data)) {
                // strip json vulnerability protection prefix
                data = data.replace(PROTECTION_PREFIX, '');
                if (JSON_START.test(data) && JSON_END.test(data))
                    data = fromJson(data);
            }
            return data;
        }],

        // transform outgoing request data
        transformRequest: [function(d) {
            return isObject(d) && !isFile(d) && !isBlob(d) ? toJson(d) : d;
        }],

        // default headers
        headers: {
            common: {
                'Accept': 'application/json, text/plain, */*'
            },
            post:   shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
            put:    shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
            patch:  shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
        },

        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
    };

    /**
     * Are ordered by request, i.e. they are applied in the same order as the
     * array, on request, but reverse order, on response.
     */
    var interceptorFactories = this.interceptors = [];

    /**
     * For historical reasons, response interceptors are ordered by the order in which
     * they are applied to the response. (This is the opposite of interceptorFactories)
     */
    var responseInterceptorFactories = this.responseInterceptors = [];

    this.$get = ['$sailsConnection', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
        function($sailsConnection, $browser, $cacheFactory, $rootScope, $q, $injector) {

            var defaultCache = $cacheFactory('$sailsSocket');

            /**
             * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
             * The reversal is needed so that we can build up the interception chain around the
             * server request.
             */
            var reversedInterceptors = [];

            angular.forEach(interceptorFactories, function(interceptorFactory) {
                reversedInterceptors.unshift(angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            });

            angular.forEach(responseInterceptorFactories, function(interceptorFactory, index) {
                var responseFn = angular.isString(interceptorFactory)
                    ? $injector.get(interceptorFactory)
                    : $injector.invoke(interceptorFactory);

                /**
                 * Response interceptors go before "around" interceptors (no real reason, just
                 * had to pick one.) But they are already reversed, so we can't use unshift, hence
                 * the splice.
                 */
                reversedInterceptors.splice(index, 0, {
                    response: function(response) {
                        return responseFn($q.when(response));
                    },
                    responseError: function(response) {
                        return responseFn($q.reject(response));
                    }
                });
            });


            /**
             * @ngdoc service
             * @kind function
             * @name ngsails.$sailsSocket
             *
             * @requires $cacheFactory
             * @requires $rootScope
             * @requires $q
             * @requires $injector
             *
             *
             *
             * @description
             * The `$sailsSocket` service is the core service that facilitates communication with sails via socket.io
             *
             *
             * For a higher level of abstraction, please check out the $sailsResource service.
             *
             * The $sailsSocket API is based on the deferred/promise APIs exposed by
             * the $q service. While for simple usage patterns this doesn't matter much, for advanced usage
             * it is important to familiarize yourself with these APIs and the guarantees they provide.
             *
             *
             * # General usage
             * The `$sailsSocket` service is a function which takes a single argument — a configuration object —
             * that is used to generate a request and returns  a promise
             * with two $sailsSocket specific methods: `success` and `error`.
             *
             * ```js
             *   $sailsSocket({method: 'GET', url: '/someUrl'}).
             *     success(function(data, status, headers, config) {
     *       // this callback will be called asynchronously
     *       // when the response is available
     *     }).
             *     error(function(data, status, headers, config) {
     *       // called asynchronously if an error occurs
     *       // or server returns response with an error status.
     *     });
             * ```
             *
             * Since the returned value of calling the $sailsSocket function is a `promise`, you can also use
             * the `then` method to register callbacks, and these callbacks will receive a single argument –
             * an object representing the response. See the API signature and type info below for more
             * details.
             *
             * # Shortcut methods
             *
             * Shortcut methods are also available. All shortcut methods require passing in the URL, and
             * request data must be passed in for POST/PUT requests.
             *
             * ```js
             *   $sailsSocket.get('/someUrl').success(successCallback);
             *   $sailsSocket.post('/someUrl', data).success(successCallback);
             * ```
             *
             * Complete list of shortcut methods:
             *
             * - $sailsSocket.get
             * - $sailsSocket.head
             * - $sailsSocket.post
             * - $sailsSocket.put
             * - $sailsSocket.delete
             * - $sailsSocket.subscribe
             *
             *
             * # Setting Headers
             *
             * The $sailsSocket service will automatically add certain headers to all requests. These defaults
             * can be fully configured by accessing the `$sailsSocketProvider.defaults.headers` configuration
             * object, which currently contains this default configuration:
             *
             * - `$sailsSocketProvider.defaults.headers.common` (headers that are common for all requests):
             *   - `Accept: application/json, text/plain, * / *`
             * - `$sailsSocketProvider.defaults.headers.post`: (header defaults for POST requests)
             *   - `Content-Type: application/json`
             * - `$sailsSocketProvider.defaults.headers.put` (header defaults for PUT requests)
             *   - `Content-Type: application/json`
             *
             * To add or overwrite these defaults, simply add or remove a property from these configuration
             * objects. To add headers for an HTTP method other than POST or PUT, simply add a new object
             * with the lowercased HTTP method name as the key, e.g.
             * `$sailsSocketProvider.defaults.headers.get = { 'My-Header' : 'value' }.
             *
             * The defaults can also be set at runtime via the `$sailsSocket.defaults` object in the same
             * fashion. For example:
             *
             * ```
             * module.run(function($sailsSocket) {
     *   $sailsSocket.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
     * });
             * ```
             *
             * In addition, you can supply a `headers` property in the config object passed when
             * calling `$sailsSocket(config)`, which overrides the defaults without changing them globally.
             *
             *
             * # Transforming Requests and Responses
             *
             * Both requests and responses can be transformed using transform functions. By default, Angular
             * applies these transformations:
             *
             * Request transformations:
             *
             * - If the `data` property of the request configuration object contains an object, serialize it
             *   into JSON format.
             *
             * Response transformations:
             *
             *  - If XSRF prefix is detected, strip it (see Security Considerations section below).
             *  - If JSON response is detected, deserialize it using a JSON parser.
             *
             * To globally augment or override the default transforms, modify the
             * `$sailsSocketProvider.defaults.transformRequest` and `$sailsSocketProvider.defaults.transformResponse`
             * properties. These properties are by default an array of transform functions, which allows you
             * to `push` or `unshift` a new transformation function into the transformation chain. You can
             * also decide to completely override any default transformations by assigning your
             * transformation functions to these properties directly without the array wrapper.  These defaults
             * are again available on the $sailsSocket factory at run-time, which may be useful if you have run-time
             * services you wish to be involved in your transformations.
             *
             * Similarly, to locally override the request/response transforms, augment the
             * `transformRequest` and/or `transformResponse` properties of the configuration object passed
             * into `$sailsSocket`.
             *

             * # Interceptors
             *
             * Before you start creating interceptors, be sure to understand the
             * $q and deferred/promise APIs.
             *
             * For purposes of global error handling, authentication, or any kind of synchronous or
             * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
             * able to intercept requests before they are handed to the server and
             * responses before they are handed over to the application code that
             * initiated these requests. The interceptors leverage the promise APIs to fulfill this need for both synchronous and asynchronous pre-processing.
             *
             * The interceptors are service factories that are registered with the `$sailsSocketProvider` by
             * adding them to the `$sailsSocketProvider.interceptors` array. The factory is called and
             * injected with dependencies (if specified) and returns the interceptor.
             *
             * There are two kinds of interceptors (and two kinds of rejection interceptors):
             *
             *   * `request`: interceptors get called with http `config` object. The function is free to
             *     modify the `config` or create a new one. The function needs to return the `config`
             *     directly or as a promise.
             *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *   * `response`: interceptors get called with http `response` object. The function is free to
             *     modify the `response` or create a new one. The function needs to return the `response`
             *     directly or as a promise.
             *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
             *     resolved with a rejection.
             *
             *
             * ```js
             *   // register the interceptor as a service
             *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return {
     *       // optional method
     *       'request': function(config) {
     *         // do something on success
     *         return config || $q.when(config);
     *       },
     *
     *       // optional method
     *      'requestError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       },
     *
     *
     *
     *       // optional method
     *       'response': function(response) {
     *         // do something on success
     *         return response || $q.when(response);
     *       },
     *
     *       // optional method
     *      'responseError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       }
     *     };
     *   });
             *
             *   $sailsSocketProvider.interceptors.push('mySocketInterceptor');
             *
             *
             *   // alternatively, register the interceptor via an anonymous factory
             *   $sailsSocketProvider.interceptors.push(function($q, dependency1, dependency2) {
     *     return {
     *      'request': function(config) {
     *          // same as above
     *       },
     *
     *       'response': function(response) {
     *          // same as above
     *       }
     *     };
     *   });

             *
             *
             * @param {object} config Object describing the request to be made and how it should be
             *    processed. The object has following properties:
             *
             *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
             *    - **url** – `{string}` – Absolute or relative URL of the resource that is being requested.
             *    - **params** – `{Object.<string|Object>}` – Map of strings or objects which will be turned
             *      to `?key1=value1&key2=value2` after the url. If the value is not a string, it will be
             *      JSONified.
             *    - **data** – `{string|Object}` – Data to be sent as the request message data.
             *    - **headers** – `{Object}` – Map of strings or functions which return strings representing
             *      HTTP headers to send to the server. If the return value of a function is null, the
             *      header will not be sent.
             *    - **xsrfHeaderName** – `{string}` – Name of HTTP header to populate with the XSRF token.
             *    - **xsrfCookieName** – `{string}` – Name of cookie containing the XSRF token.
             *    - **transformRequest** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      request body and headers and returns its transformed (typically serialized) version.
             *    - **transformResponse** –
             *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
             *      transform function or an array of such functions. The transform function takes the http
             *      response body and headers and returns its transformed (typically deserialized) version.
             *    - **cache** – `{boolean|Cache}` – If true, a default $sailsSocket cache will be used to cache the
             *      GET request, otherwise if a cache instance built with
             *      $cacheFactory, this cache will be used for
             *      caching.
             *    - **timeout** – `{number|Promise}` – timeout in milliseconds, or a promise
             *      that should abort the request when resolved.
             *    - **withCredentials** - `{boolean}` - whether to to set the `withCredentials` flag on the
             *      XHR object. See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5
             *      for more information.
             *    - **responseType** - `{string}` - see
             *      [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
             *
             * @returns {Promise} Returns a promise object with the
             *   standard `then` method and two http specific methods: `success` and `error`. The `then`
             *   method takes two arguments a success and an error callback which will be called with a
             *   response object. The `success` and `error` methods take a single argument - a function that
             *   will be called when the request succeeds or fails respectively. The arguments passed into
             *   these functions are destructured representation of the response object passed into the
             *   `then` method. The response object has these properties:
             *
             *   - **data** – `{string|Object}` – The response body transformed with the transform
             *     functions.
             *   - **status** – `{number}` – HTTP status code of the response.
             *   - **headers** – `{function([headerName])}` – Header getter function.
             *   - **config** – `{Object}` – The configuration object that was used to generate the request.
             *   - **statusText** – `{string}` – HTTP status text of the response.
             *
             * @property {Array.<Object>} pendingRequests Array of config objects for currently pending
             *   requests. This is primarily meant to be used for debugging purposes.
             *

             */

            function $sailsSocket(requestConfig) {
                var config = {
                    method: 'get',
                    transformRequest: defaults.transformRequest,
                    transformResponse: defaults.transformResponse
                };
                var headers = mergeHeaders(requestConfig);

                angular.extend(config, requestConfig);
                config.headers = headers;
                config.method = uppercase(config.method);

                var xsrfValue = urlIsSameOrigin(config.url)
                    ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName]
                    : undefined;
                if (xsrfValue) {
                    headers[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                }


                var serverRequest = function(config) {
                    headers = config.headers;
                    var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

                    // strip content-type if data is undefined
                    if (isUndefined(reqData)) {
                        forEach(headers, function(value, header) {
                            if (lowercase(header) === 'content-type') {
                                delete headers[header];
                            }
                        });
                    }

                    if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
                        config.withCredentials = defaults.withCredentials;
                    }

                    // send request
                    return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                };

                var chain = [serverRequest, undefined];
                var promise = $q.when(config);

                // apply interceptors
                forEach(reversedInterceptors, function(interceptor) {
                    if (interceptor.request || interceptor.requestError) {
                        chain.unshift(interceptor.request, interceptor.requestError);
                    }
                    if (interceptor.response || interceptor.responseError) {
                        chain.push(interceptor.response, interceptor.responseError);
                    }
                });

                while(chain.length) {
                    var thenFn = chain.shift();
                    var rejectFn = chain.shift();

                    promise = promise.then(thenFn, rejectFn);
                }

                promise.success = function(fn) {
                    promise.then(function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, config);
                    });
                    return promise;
                };

                return promise;

                function transformResponse(response) {
                    // make a copy since the response must be cacheable
                    var resp = angular.extend({}, response, {
                        data: transformData(response.data, response.headers, config.transformResponse)
                    });
                    return (isSuccess(response.status))
                        ? resp
                        : $q.reject(resp);
                }

                function mergeHeaders(config) {
                    var defHeaders = defaults.headers,
                        reqHeaders = angular.extend({}, config.headers),
                        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

                    defHeaders = angular.extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                    // execute if header value is function
                    execHeaders(defHeaders);
                    execHeaders(reqHeaders);

                    // using for-in instead of forEach to avoid unecessary iteration after header has been found
                    defaultHeadersIteration:
                        for (defHeaderName in defHeaders) {
                            lowercaseDefHeaderName = lowercase(defHeaderName);

                            for (reqHeaderName in reqHeaders) {
                                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                    continue defaultHeadersIteration;
                                }
                            }

                            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                        }

                    return reqHeaders;

                    function execHeaders(headers) {
                        var headerContent;

                        forEach(headers, function(headerFn, header) {
                            if (isFunction(headerFn)) {
                                headerContent = headerFn();
                                if (headerContent != null) {
                                    headers[header] = headerContent;
                                } else {
                                    delete headers[header];
                                }
                            }
                        });
                    }
                }
            }

            $sailsSocket.pendingRequests = [];

            /**
             * @ngdoc method
             * @name $sailsSocket#get
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `GET` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#delete
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `DELETE` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#head
             * @methodOf ngsails.$sailsSocket
             *
             *
             * @description
             * Shortcut method to perform `HEAD` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#subscribe
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Low-level method to register handlers for socket.io events.
             *
             * @param {string} eventName Name of server-emitted event to listen for.
             *
             * @param {Function} eventHandler Method to fire when event is recieved.
             *
             */
            createShortMethods('get', 'delete', 'head');

            /**
             * @ngdoc method
             * @name $sailsSocket#post
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `POST` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#put
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Shortcut method to perform `PUT` request.
             *
             * @param {string} url Relative or absolute URL specifying the destination of the request
             * @param {*} data Request content
             * @param {Object=} config Optional configuration object
             * @returns {HttpPromise} Future object
             */

            /**
             * @ngdoc method
             * @name $sailsSocket#on
             * @methodOf ngsails.$sailsSocket
             *
             * @description
             * Subscribes to an incoming socket event
             *
             * @param {string} event socket event name to listen for.
             * @param {function} callback listener function
             * @returns {HttpPromise} Future object
             */

            $sailsSocket.on = $sailsConnection.addListener;
            $sailsSocket.addListener = $sailsConnection.addListener;

            $sailsSocket.subscribe = $sailsConnection.addListener;



            createShortMethodsWithData('post', 'put');

            /**
             * @ngdoc property
             * @name $sailsSocket#defaults
             * @propertyOf ngsails.$sailsSocket
             *
             *
             * @description
             * Runtime equivalent of the `$sailsSocketProvider.defaults` property. Allows configuration of
             * default headers, withCredentials as well as request and response transformations.
             *
             * See "Setting HTTP Headers" and "Transforming Requests and Responses" sections above.
             */
            $sailsSocket.defaults = defaults;



            return $sailsSocket;


            function createShortMethods(names) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url
                        }));
                    };
                });
            }


            function createShortMethodsWithData(name) {
                angular.forEach(arguments, function(name) {
                    $sailsSocket[name] = function(url, data, config) {
                        return $sailsSocket(angular.extend(config || {}, {
                            method: name,
                            url: url,
                            data: data
                        }));
                    };
                });
            }


            /**
             * Makes the request.
             *
              */
            function sendReq(config, reqData, reqHeaders) {
                var deferred = $q.defer(),
                    promise = deferred.promise,
                    cache,
                    cachedResp,
                    url = buildUrl(config.url, config.params);

                $sailsSocket.pendingRequests.push(config);
                promise.then(removePendingReq, removePendingReq);


                if ((config.cache || defaults.cache) && config.cache !== false && (config.method === 'GET' || config.method === 'JSONP')) {
                    cache = isObject(config.cache) ? config.cache
                    : isObject(defaults.cache) ? defaults.cache
                    : defaultCache;
                }

                if (cache) {
                    cachedResp = cache.get(url);
                    if (isDefined(cachedResp)) {
                        if (cachedResp.then) {
                            // cached request has already been sent, but there is no response yet
                            cachedResp.then(removePendingReq, removePendingReq);
                            return cachedResp;
                        } else {
                            // serving from cache
                            if (isArray(cachedResp)) {
                                resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]);
                            } else {
                                resolvePromise(cachedResp, 200, {}, 'OK');
                            }
                        }
                    } else {
                        // put the promise for the non-transformed response into cache as a placeholder
                        cache.put(url, promise);
                    }
                }

                // if we won't have the response in cache, send the request to the backend
                if (angular.isUndefined(cachedResp)) {
                    $sailsConnection.request(config.method, url, reqData, done, reqHeaders, config.timeout,
                        config.withCredentials, config.responseType);
                }

                return promise;


                /**
                 * Callback registered to $sailsSocketBackend():
                 *  - caches the response if desired
                 *  - resolves the raw $sailsSocket promise
                 *  - calls $apply
                 */
                function done(status, response, headersString, statusText) {
                    if (cache) {
                        if (isSuccess(status)) {
                            cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                        } else {
                            // remove promise from the cache
                            cache.remove(url);
                        }
                    }

                    resolvePromise(response, status, headersString, statusText);
                    if (!$rootScope.$$phase) $rootScope.$apply();
                }


                /**
                 * Resolves the raw $sailsSocket promise.
                 */
                function resolvePromise(response, status, headers, statusText) {
                    // normalize internal statuses to 0
                    status = Math.max(status, 0);

                    (isSuccess(status) ? deferred.resolve : deferred.reject)({
                        data: response,
                        status: status,
                        headers: headersGetter(headers),
                        config: config,
                        statusText : statusText
                    });
                }


                function removePendingReq() {
                    var idx = indexOf($sailsSocket.pendingRequests, config);
                    if (idx !== -1) $sailsSocket.pendingRequests.splice(idx, 1);
                }
            }


            function buildUrl(url, params) {
                if (!params) return url;
                var parts = [];
                forEachSorted(params, function(value, key) {
                    if (value === null || isUndefined(value)) return;
                    if (!isArray(value)) value = [value];

                    angular.forEach(value, function(v) {
                        if (isObject(v)) {
                            if (isDate(v)){
                                v = v.toISOString();
                            } else if (isObject(v)) {
                                v = toJson(v);
                            }
                        }
                        parts.push(encodeUriQuery(key) + '=' +
                         encodeUriQuery(v));
                    });
                });
                if(parts.length > 0) {
                    url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
                }
                return url;
            }


        }];
})

'use strict';
angular.module('angularSails').provider('$sailsConnection',function sailsBackendProvider() {


        var config =  {
            url: 'http://localhost:1337',
            autoConnect: true,
            ioSocket: undefined

        }

        this.config = config;

        function createSailsBackend($sailsSocketFactory,$browser, $window, $injector, $q, $timeout){

        var tick = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };


        var deferredSocket = $q.defer();

        var socket = config.ioSocket || $sailsSocketFactory();

        if(socket.connected){
            deferredSocket.resolve(socket);
        }
        else{
            socket.on('connect',function(){
                deferredSocket.resolve(socket);
            });
        }




        function openConnection(){
            return deferredSocket.promise;
        }


        function connection(url,options){

        }

        connection._listeners = [];
        connection.connect = function(){
            return openConnection.promise;
        }

        connection.request = function(method, url, post, callback, headers, timeout, withCredentials, responseType){





            function socketResponse(response){
                callback(response.statusCode || 200,response.body || {}, response.headers || {}, response.statusText);
                //status, response, headersString, statusText
            }




            url = url || $browser.url();


            openConnection().then(function(ioSocket){

                ioSocket.emit(method.toLowerCase(),{ url: url, data: fromJson(post) },socketResponse);
            });

        }


        /**
        * Adds a notification listener
        * @param {callback} callback The callback to receive updates from the connection
        * @returns {handle} The callback handle
        */
        connection.addListener = function (eventName,callback) {
            return socket.addListener(eventName,callback);
        };

        /**
        * Removes a notification listener
        * @param {handle} handle The handle for the callback
        */
        connection.removeListener = function (eventName,callback) {
            return socket.removeListener(eventName,callback)
        };


        return connection;

    }

    /**
    * @ngdoc service
    * @name ngsails.$sailsSocketBackend
    * @requires $window
    * @requires $document
    *
    * @description
    * Service used by the $sailsSocket that delegates to a
    * Socket.io connection (or in theory, any connection type eventually)
    *
    * You should never need to use this service directly, instead use the higher-level abstractions:
    * $sailsSocket or $sailsResource.
    *
    * During testing this implementation is swapped with $sailsMockBackend
    *  which can be trained with responses.
    */

    this.$get = ['$sailsSocketFactory','$browser', '$window','$injector', '$q','$timeout', function($sailsSocketFactory,$browser, $window, $injector, $q,$timeout) {
        return createSailsBackend($sailsSocketFactory,$browser,$window, $injector, $q,$timeout);
    }];




});


angular.module('angularSails');


angular.module('angularSails').factory('SailsExtend',function(){


})

angular.module('angularSails').factory('SailsInherits',function(){

    
})



'use strict';
// NOTE:  The usage of window and document instead of $window and $document here is
// deliberate.  This service depends on the specific behavior of anchor nodes created by the
// browser (resolving and parsing URLs) that is unlikely to be provided by mock objects and
// cause us to break tests.  In addition, when the browser resolves a URL for XHR, it
// doesn't know about mocked locations and resolves URLs to the real document - which is
// exactly the behavior needed here.  There is little value is mocking these out for this
// service.
var urlParsingNode = document.createElement("a");
var originUrl = urlResolve(window.location.href, true);

/**
 * Chain all given functions
 *
 * This function is used for both request and response transforming
 *
 * @param {*} data Data to transform.
 * @param {function(string=)} headers Http headers getter fn.
 * @param {(Function|Array.<Function>)} fns Function or an array of functions.
 * @returns {*} Transformed data.
 */
function transformData(data, headers, fns) {
    if (isFunction(fns))
        return fns(data, headers);

    forEach(fns, function(fn) {
        data = fn(data, headers);
    });

    return data;
}

function shallowCopy(src, dst) {
  if (isArray(src)) {
    dst = dst || [];

    for ( var i = 0; i < src.length; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    for (var key in src) {
      if (hasOwnProperty.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}


function isSuccess(status) {
    return 200 <= status && status < 300;
}


/**
 * Parse headers into key value object
 *
 * @param {string} headers Raw headers as a string
 * @returns {Object} Parsed headers as key value object
 */
function parseHeaders(headers) {
    var parsed = {}, key, val, i;

    if (!headers) return parsed;

    forEach(headers.split('\n'), function(line) {
        i = line.indexOf(':');
        key = lowercase(trim(line.substr(0, i)));
        val = trim(line.substr(i + 1));

        if (key) {
            if (parsed[key]) {
                parsed[key] += ', ' + val;
            } else {
                parsed[key] = val;
            }
        }
    });

    return parsed;
}
/**
 * Returns a function that provides access to parsed headers.
 *
 * Headers are lazy parsed when first requested.
 * @see parseHeaders
 *
 * @param {(string|Object)} headers Headers to provide access to.
 * @returns {function(string=)} Returns a getter function which if called with:
 *
 *   - if called with single an argument returns a single header value or null
 *   - if called with no arguments returns an object containing all headers.
 */
function headersGetter(headers) {
    var headersObj = isObject(headers) ? headers : undefined;

    return function(name) {
        if (!headersObj) headersObj =  parseHeaders(headers);

        if (name) {
            return headersObj[lowercase(name)] || null;
        }

        return headersObj;
    };
}



var trim = (function() {
  // native trim is way faster: http://jsperf.com/angular-trim-test
  // but IE doesn't have it... :-(
  // TODO: we should move this into IE/ES5 polyfill
  if (!String.prototype.trim) {
    return function(value) {
      return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
    };
  }
  return function(value) {
    return isString(value) ? value.trim() : value;
  };
})();

function urlResolve(url, base) {
    var href = url;

    if (typeof msie !== 'undefined') {
        // Normalize before parse.  Refer Implementation Notes on why this is
        // done in two steps on IE.
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}

var toString          = Object.prototype.toString;
/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The url of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function urlIsSameOrigin(requestUrl) {
    var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
    return (parsed.protocol === originUrl.protocol &&
        parsed.host === originUrl.host);
}

function buildUrl(url, params) {
    if (!params) return url;
    var parts = [];
    angular.forEach(params, function(value, key) {
        if (value === null || angular.isUndefined(value)) return;
        if (!isArray(value)) value = [value];

        angular.forEach(value, function(v) {
            if (isObject(v)) {
                v = toJson(v);
            }
            parts.push(encodeUriQuery(key) + '=' +
                encodeUriQuery(v));
        });
    });
    if(parts.length > 0) {
        url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
    }
    return url;
}
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


function toJsonReplacer(key, value) {
    var val = value;

    if (typeof key === 'string' && key.charAt(0) === '$') {
        val = undefined;
    } else if (isWindow(value)) {
        val = '$WINDOW';
    } else if (value &&  document === value) {
        val = '$DOCUMENT';
    } else if (isScope(value)) {
        val = '$SCOPE';
    }

    return val;
}

function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)){
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isArrayLike(obj)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn) {
    return function(value, key) { iteratorFn(key, value); };
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


function valueFn(value) {return function() {return value;};}


function isUndefined(value){return typeof value === 'undefined';}


function isDefined(value){return typeof value !== 'undefined';}
function isObject(value){return value != null && typeof value === 'object';}
function isString(value){return typeof value === 'string';}
function isNumber(value){return typeof value === 'number';}
function isDate(value){
    return toString.call(value) === '[object Date]';
}
function isFunction(value){return typeof value === 'function';}

function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
    return toString.call(obj) === '[object File]';
}


function isBlob(obj) {
    return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
    return typeof value === 'boolean';
}

function isArray(value) {
    return toString.call(value) === '[object Array]';
}



/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return isString(obj) || isArray(obj) || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in obj;
}

function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
var hasOwnProperty = Object.prototype.hasOwnProperty;

function mergeHeaders(config) {
    var defHeaders = defaults.headers,
        reqHeaders = extend({}, config.headers),
        defHeaderName, lowercaseDefHeaderName, reqHeaderName;

    defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

    // execute if header value is function
    execHeaders(defHeaders);
    execHeaders(reqHeaders);

    // using for-in instead of forEach to avoid unecessary iteration after header has been found
    defaultHeadersIteration:
        for (defHeaderName in defHeaders) {
            lowercaseDefHeaderName = lowercase(defHeaderName);

            for (reqHeaderName in reqHeaders) {
                if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                    continue defaultHeadersIteration;
                }
            }

            reqHeaders[defHeaderName] = defHeaders[defHeaderName];
        }

    return reqHeaders;

    function execHeaders(headers) {
        var headerContent;

        forEach(headers, function(headerFn, header) {
            if (isFunction(headerFn)) {
                headerContent = headerFn();
                if (headerContent != null) {
                    headers[header] = headerContent;
                } else {
                    delete headers[header];
                }
            }
        });
    }
}

var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
        : s;
};
var manualUppercase = function(s) {
    /* jshint bitwise: false */
    return isString(s)
        ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
        : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.
if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}

function toJson(obj, pretty) {
    if (typeof obj === 'undefined') return undefined;
    return JSON.stringify(obj, toJsonReplacer, pretty ? '  ' : null);
}



function fromJson(json) {
    return isString(json)
        ? JSON.parse(json)
        : json;
}

function size(obj, ownPropsOnly) {
    var count = 0, key;

    if (isArray(obj) || isString(obj)) {
        return obj.length;
    } else if (isObject(obj)){
        for (key in obj)
            if (!ownPropsOnly || obj.hasOwnProperty(key))
                count++;
    }

    return count;
}


function includes(array, obj) {
    return indexOf(array, obj) != -1;
}

function indexOf(array, obj) {
    if (array.indexOf) return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (obj === array[i]) return i;
    }
    return -1;
}

function arrayRemove(array, value) {
    var index = indexOf(array, value);
    if (index >=0)
        array.splice(index, 1);
    return value;
}



})(angular,io);
