/**
 * Extensions to angular's built in $q
 *
 *
 */

angular.module('sails.promise',[])
    .config(['$provide',function($provide){
        $provide.decorator( "$q", function( $delegate )
    {
        // Let's add a `spread()`; useful with $q.all()
        $delegate.spread = function( targetFn,scope )
        {
            return function()
            {
                var params = [].concat(arguments[0]);
                targetFn.apply(scope, params);
            };
        };
        return $delegate;
    });
}])