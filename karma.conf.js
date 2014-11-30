module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
    'vendor/angular/angular.js',
    'vendor/angular-mocks/angular-mocks.js',
    ,
    'test/unit/*.spec.js',
    'test/mocks/*.js',
    'test/helpers/*.js',
    'dist/angular-sails.js'
    ]
  });
};
