angular.module('angularSails.model', []).provider('$sailsModel',function(){

	this.$get = [function(){

		function SailsModel(resource,data){

				Object.defineProperty(this,'resource',{
					value: resource,
					enumerable: false
				})

		}

		return SailsModel;


	}]




})