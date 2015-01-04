var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

function decode(body) {
  var form = new FormData()
  body.trim().split('&').forEach(function(bytes) {
    if (bytes) {
      var split = bytes.split('=')
      var name = split.shift().replace(/\+/g, ' ')
      var value = split.join('=').replace(/\+/g, ' ')
      form.append(decodeURIComponent(name), decodeURIComponent(value));
    }
  })
  return form
}

function headers(xhr) {
  var head = new Headers()
  var pairs = xhr.getAllResponseHeaders().trim().split('\n')
  pairs.forEach(function(header) {
    var split = header.trim().split(':')
    var key = split.shift().trim()
    var value = split.join(':').trim()
    head.append(key, value)
  })
  return head
}

function normalizeMethod(method,transport) {

  if(transport && transport == 'io'){
    return method.toLowerCase();
  }

  var upcased = method.toUpperCase()
  return (methods.indexOf(upcased) > -1) ? upcased : method
}
