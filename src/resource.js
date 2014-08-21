
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
* @name $sailsResource
*
*
* # angularSails.resource
*
* The `angularSails.resource` module provides a client-side model layer for use with a SailsJS API.
*
*
*/

angular.module('angularSails.resource', ['ng']).
provider('$sailsResource', function () {
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
            'stream': {method: 'GET'}
        },
    };

    this.$get = ['$q', '$cacheFactory','$injector','$sailsSocket',function ($q, $cacheFactory,$injector,$sailsSocket) {

        var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction;


        var SailsModel = {};


        'use strict';




        var $sailsResourceMinErr = angular.$$minErr('$sailsResource');

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
                throw $sailsResourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', 'bad path');
            }
            var keys = path.split('.');
            for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
                var key = keys[i];
                obj = (obj !== null) ? obj[key] : undefined;
            }
            return obj;
        }

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
            this.defaults = extend({}, provider.defaults, defaults);
            this.urlParams = {};
        }

        Route.prototype = {
            setUrlParams: function (config, params, actionUrl) {
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


                function resourceFactory(modelIdentity, model) {

                    var paramDefaults = {id : '@id'}

                    var modelAttrs = model.attributes || {};

                    var Model = angular.extend(SailsModel,{attributes: modelAttrs})

                    delete model.attributes;

                    var url = provider.basePath || '/' + modelIdentity.toLowerCase() + '/:id/:populate'

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
                        * SailsResource
                        */

                        function SailsResource(value) {
                            shallowClearAndCopy(value || {}, this);
                        }


                        forEach(actions, function (action, name) {
                          var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

                          SailsResource[name] = function (a1, a2, a3, a4) {
                            var params = {}, data;

                            if(!hasBody){
                                params = a1;
                            }

                            else{
                                data = a1;
                            }


                            var isInstanceCall = this instanceof SailsResource;
                            var value = isInstanceCall ? data : (action.isArray ? [] : new SailsResource(data));
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

                            var request = $sailsSocket(httpConfig).then(function (response) {
                              var data = response.data;


                              if (data) {
                                // Need to convert action.isArray to boolean in case it is undefined
                                // jshint -W018
                                if (angular.isArray(data) !== (!!action.isArray)) {
                                  throw $sailsResourceMinErr('badcfg',
                                      'Error in resource configuration. Expected ' +
                                      'response to contain an {0} but got an {1}','test');
                                }
                                // jshint +W018
                                if (action.isArray) {
                                  value.length = 0;
                                  forEach(data, function (item) {
                                    if (typeof item === "object") {
                                      value.push(new SailsResource(item));
                                    } else {
                                      // Valid JSON values may be string literals, and these should not be converted
                                      // into objects. These items will not have access to the Resource prototype
                                      // methods, but unfortunately there
                                      value.push(item);
                                    }
                                  });
                                } else {
                                  shallowClearAndCopy(data, value);

                                }

                                return value;
                              }



                          }, function (error) {

                              return $q.reject(error);
                            });

                            return request;

                          };



                        });

                        SailsResource.onUpdate = function(data){
                            console.log(data);
                        }


                        SailsResource.prototype.destroy = function () {

                        };

                        SailsResource.bind = function (additionalParamDefaults) {
                            return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
                        };

                        $sailsSocket.addListener(modelIdentity,SailsResource.onUpdate);

                        return SailsResource;
                    }

                    return resourceFactory;
                }];
            });
