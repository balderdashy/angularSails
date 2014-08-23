angular.module('angularSails.model', ['angularSails.route']).provider('$sailsModel',function(){

	this.$get = ['$sailsRoute',function($sailsRoute){

		return function SailsModelFactory(modelConfig){

			function SailsModel(resource,data){

				Object.defineProperty(this,'resource',{
					value: resource,
					enumerable: false
				})

			}

		}




	}]




})