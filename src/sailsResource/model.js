"use strict";

//basic inheritance functionality....
Function.prototype.inherits = function (base) {
    var _constructor;
    _constructor = this;
    return _constructor = base.apply(_constructor);
};






function SailsModel() {

    var Model = this;


    var Record = Model.prototype;

    Record.save = function(){
        console.log('saving!')
    }

    var defaultAttrs = {
        id : { primaryKey : true}
    }



    Model.new = function(data){
        if(!data) data = {};

        return new Model(data);
    }



    Model.find = function(){
        console.log('finding!' + this.identity);
    };

    var MODEL_INSTANCE_ACTIONS = {
        'save' : {method : 'PUT'},
        'destroy' : {method : 'DELETE'}
    };



    var COLLECTION_ACTIONS = {
        'find': { method:'get'},
        'findOne': { method:'get'},
        'create' : { method : 'post'},
        'update' : { method : 'put'},
        'destroy' : { method : 'delete'}
    };

//    var _collection = this;
//
//    var _controller = angular.extend(COLLECTION_ACTIONS,controller || {});
//
//    var _properties = {}

//    _properties.identity = model.identity || modelName.toLowerCase();
//    _properties.name = modelName;
//    _properties.basePath = '/' + model.identity;

    Object.defineProperty(Model, '_attributes', {
        enumerable: false,
        writable: false,
        value: defaultAttrs
    });

//    Object.defineProperty(Model, '_connection', {
//        enumerable: false,
//        writable: false,
//        value: connection
//    });
//
//    Object.defineProperty(Model, '_model', {
//        enumerable: false,
//        writable: false,
//        value: model
//    });

//    forEach(_controller,function(action,key){
//
//
//        _collection[key] = function(){
//
//            return _collection._connection[action.method](_collection._properties.basePath,arguments);
//
//
//
//        }
//
//    })

    return Model;
};



function SailsModelProvider(){



    this.$get = ['$injector',function($injector){


            return SailsModel;


    }];

}