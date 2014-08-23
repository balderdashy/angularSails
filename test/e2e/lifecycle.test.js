beforeEach(function() {
  browser.get('http://127.0.0.1:1337/');
});

it('should find title element', function() {
  browser.get('index.html');

  browser.debugger();

  element(by.binding('user.name'));
});