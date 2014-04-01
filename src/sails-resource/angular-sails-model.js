'use strict';

/**
 * @ngdoc module
 * @name sails.model
 * @file angular-sails-model.js
 *
 * @description
 *
 *
 *
 *
 * http://github.com/balderdashy/angularSails
 */

angular.module('angularSails.model',[])


/**
 * A custom object extension method that copies property getter function definitions across from
 * the source to the target, rather than trying to just evaluate the property on the source and
 * copying that across.
 *
 * Otherwise takes the same arguments as `angular.extend`.
 */

    .factory('$$sailsExtend',function(){

       return function extend(dst) {
                angular.forEach(arguments, function(obj){
                    if (obj !== dst) {
                        for (var key in obj) {
                            var propertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);

                            // If we encounter a getter function,
                            if (propertyDescriptor && propertyDescriptor.get) {
                                // Manually copy the definition across rather than doing a regular copy, as the latter
                                // approach would result in the getter function being evaluated. Need to make it
                                // enumerable so subsequent mixins pass through the getter.
                                Object.defineProperty(
                                    dst, key, {get: propertyDescriptor.get, enumerable: true, configurable: true}
                                );
                            } else {
                                // Otherwise, just do a regular copy
                                dst[key] = obj[key];
                            }
                        };
                    }
                });

                return dst;
            };
    })

/**
 * A base mixin that other mixins can extend upon. Provides basic infrastructure for defining new
 * mixins (`extend`) and mixing them into objects (`mixInto`).
 */
    .factory('$sailsObject',['$$sailsExtend', '$$sailsMemoize', function(extend, memoize) {
        return {
            /**
             * Defines a new mixin with a set of properties. Multiple sets of properties can be provided.
             * If two property sets define the same property name, the last one will take priority.
             *
             * Mixins can extend upon each other.
             */
            extend: function() {
                var args = Array.prototype.slice.call(arguments);
                return extend.apply(null, [{}, this].concat(args));
            },
            /**
             * Mixes the properties of this mixin into an object. If the mixin defines a beforeMixingInto
             * method, that will get called _before_ the mixing occurs.
             *
             * The first argument is the object to mix into. This will also be passed to beforeMixingInto.
             * If any subsequent arguments are provided, they will also be passed to beforeMixingInto.
             */
            mixInto: function() {
                var object = arguments[0];
                // If we're actually mixing into something,
                if (object) {
                    // If we've got some mixing customization todo, then invoke it
                    if (this.beforeMixingInto) this.beforeMixingInto.apply(this, arguments);

                    // Always do this
                    extend(object, this);

                    // Setup memoization
                    angular.forEach(this.memoize, function(propertyName) {
                        var propertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);

                        // If the property is a getter function,
                        if (propertyDescriptor && propertyDescriptor.get) {
                            // Redefine the propery getter to be memoized
                            Object.defineProperty(object, propertyName, {
                                get: memoize(propertyDescriptor.get), enumerable: true, configurable: true
                            });
                        } else {
                            var value = object[propertyName];
                            // If the property is a function
                            if (angular.isFunction(value)) {
                                // Redefine it to be memoized
                                object[propertyName] = memoize(value);
                            } else {
                                // If it's an array, check that each element is unmemoizable
                                if (angular.isArray(value)) {
                                    angular.forEach(value, function(element, index) {
                                        if (angular.isUndefined(element.unmemoize)) {
                                            throw "The array property '" + propertyName + "' is marked as memoizable, but " +
                                                "the element at index " + index + " doesn't have an unmemoize method";
                                        }
                                    });
                                } else {
                                    // If the property is an object, make sure it's unmemoizable
                                    if (angular.isUndefined(value.unmemoize)) {
                                        throw "The property '" + propertyName + "' is marked as memoizable, but it doesn't " +
                                            "have an unmemoize method";
                                    }
                                }
                            }
                        }
                    }, this);

                    return object;
                }
            },
            unmemoize: function() {
                angular.forEach(this.memoize, function(propertyName) {
                    var propertyDescriptor = Object.getOwnPropertyDescriptor(this, propertyName);

                    // If the property has a getter function,
                    if (propertyDescriptor && propertyDescriptor.get) {
                        // Unmemoize the function
                        propertyDescriptor.get.unmemoize();
                    } else {
                        var value = this[propertyName];
                        // If the property is a function
                        if (angular.isFunction(value)) {
                            // Unmemoize it
                            value.unmemoize();
                        } else {
                            // If it's an array, unmemoize each element
                            if (angular.isArray(value)) {
                                angular.forEach(value, function(element, index) {
                                    element.unmemoize();
                                });
                            } else {
                                // Otherwise, unmemoize directly
                                value.unmemoize();
                            }
                        }
                    }
                }, this);
            }
        };
    }])

    .factory('$$sailsIdentityMap',
    /**
     * A simple identity-map implementation. This can be used to ensure that, for some class
     * descriptor and ID, only one instance of a particular object is ever used.
     */
        function(extend) {
        var identityMap = {};
        /*
         * Identity-maps an object. This means that:
         *
         * - If an object with the same class and ID already exists in the map, the new object will be
         *   merged into the existing one, and the existing object returned.
         * - If an object with the same class and ID does _not_already exist in the map, it will be
         *   stored in the map and returned
         *
         * @param  {String} className a string descriptor of the class of the object
         * @param  {Object} object the object to be mapped
         * @return {Object} the identity-mapped object
         */
        return function(className, object) {
            if (object) {
                var mappedObject;
                if (identityMap[className]) {
                    mappedObject = identityMap[className][object.id];
                    if (mappedObject) {
                        extend(mappedObject, object);
                    } else {
                        identityMap[className][object.id] = object;
                        mappedObject = object;
                    }
                } else {
                    identityMap[className] = {};
                    identityMap[className][object.id] = object;
                    mappedObject = object;
                }
                return mappedObject;
            }
        };
    })


    .factory('$$sailsMemoize', function() {
        function unmemoize() {
            delete this._cache;
        };
        /*
         * Memoizes a function
         *
         * @param {function()} func the function to be memoized
         * @return {function()} a new wrapper function that, when invoked for the first time, will
         *   invoke the original function, storing the result and returning it. On subsequent
         *   invocations, this result will be returned immediately rather than the original function
         *   being invoked again. The wrapper function will also have an `unmemoize` method that, when
         *   invoked, will clear any memoized value. This means that the next invocation of the
         *   wrapper will trigger the memoization process again - ie, invoking the original function,
         *   storing the result, etc.
         */
        return function(func) {
            if (!angular.isFunction(func)) {
                throw new TypeError;
            }
            var memoized = function() {
                if (!angular.isDefined(memoized._cache)) {
                    // We need to store the result in a cache rather than storing it directly on the function
                    // so that we can use the presence of the cache to indicate whether we are currenly
                    // memoizing or not.
                    memoized._cache = {result: func.apply(this, arguments)};
                }
                return memoized._cache.result;
            }

            memoized.unmemoize = unmemoize;

            return memoized;
        };
    })

    .factory('$sailsModelController',function(){

        var SailsModelController = function(config){


        }

        SailsModelController.prototype.find = function(query){}

        return SailsModelController;

    })

    .provider('$sailsResource',function(){



        var _modelDefs = {}

        var SailsResourceProvider = function($injector,SailsBaseModel,SailsModelController){

            var _sailsModels = {};


            angular.forEach(_modelDefs,function(_model,_modelIdentity){
                console.log(_model)
              // var model = _initModel(_modelIdentity)

              _sailsModels[_modelIdentity] = function(){
                  return {
                      food : function(){}
                  }
              }

            })


            return {
                models : _sailsModels
            }
        };

        SailsResourceProvider.prototype.extend = function(model){

        }


        function _registerModel(identity,modelDef,modelCtrl){

            console.log(identity)
                _modelDefs[identity] = {
                    foo : function(){}
                }

        }

        return {
            '$get' : ['$injector','$sailsBaseModel','$sailsModelController',SailsResourceProvider],
            model : _registerModel
        }





    }).run(function(){



    })