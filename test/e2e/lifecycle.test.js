describe('angularSails E2E',function(){


it('should find title element', function() {
  browser.get('/');

  //browser.debugger();

  	expect(browser.getTitle()).toEqual('angularSails');
});


})