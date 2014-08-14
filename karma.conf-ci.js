console.log(process.env)
module.exports = function(config) {

  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
  }

  // Browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/OS combos
  var customLaunchers = {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '26'
    }
  };

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'vendor/angular/angular.js',

      'vendor/angular-mocks/angular-mocks.js',
      'tests/mocks/mockSailsConnectionBackend.js',
      'tests/helpers/matchers.js',
      {pattern: 'lib/**/*.js', watched: true, included: true, served: true},

      'src/**/*.js',
      'tests/**/*.spec.js',

    ],

    reporters: ['progress', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    sauceLabs: {
      testName: 'angularSails',
      recordScreenshots: true,
      connectOptions: {
        port: 5757,
        logfile: 'sauce_connect.log'
      }
    },
    logLevel: 'debug',
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  });
};
