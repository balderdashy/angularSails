
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
                        console.log('init')
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
