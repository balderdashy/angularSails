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

