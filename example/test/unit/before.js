/**
 * Before running any API tests, load (but don't lift!) our app.
 *
 * NOTICE:
 * This exposes the `sails` global.
 *
 * @framework mocha
 */
console.log('yay')
before(function (done) {
  require('sails').load({
    log: { level: 'error' },
    hooks: { grunt: false }
  }, done);
});
