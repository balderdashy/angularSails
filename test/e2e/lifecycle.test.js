describe('angularSails E2E',function(){

	beforeEach(function() {
  
});

it('should find title element', function() {
  browser.get('index.html');

  //browser.debugger();

  	expect(browser.getTitle()).toEqual('angularSails');
});


})