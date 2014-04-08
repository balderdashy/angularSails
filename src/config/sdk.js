/**
 * @ngdoc constant
 * @name sails.io.$SAILS_SDK_PARAMS
 *
 * @description
 *
 * //TODO
 *
 */
angular.module('sails').constant('$$sailsSDKParams', {

    version: '0.10.0',  // TODO: pull this automatically from package.json during build.
    platform: typeof module === 'undefined' ? 'browser' : 'node',
    language: 'javascript',
    flavor: 'angular'

});