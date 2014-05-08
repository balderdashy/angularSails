/**
 * @ngDoc function
 * @name angularSails.io.SailsResponse
 *
 * @description
 *
 * Transforms a raw sails response into a $http-like responseObject
 *
 * @param requestContext
 * @param responseContext
 * @constructor
 */

function SailsResponse(requestContext, responseContext) {

    if(angular.isString(responseContext)){
        responseContext = angular.fromJson(responseContext);

    }

    this.data = responseContext.body || {};
    this.headers = responseContext.headers || {};
    this.status = responseContext.statusCode || 200;
    this.config = requestContext;

}