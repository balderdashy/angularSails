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
