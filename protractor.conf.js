exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',

  allScriptsTimeout: 11000,
  framework: 'jasmine',
 
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
   // 'browserName': 'internet explorer', - special installation needed
   // 'version':'10',
   'browserName': 'chrome',
   //'browserName': 'firefox'
  },
  baseUrl:'http://127.0.0.1:1337',
  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['test/e2e/**/*.test.js'],
 
  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};