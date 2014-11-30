
describe('angularSails E2E',function(){


var ptor = protractor.getInstance();




it('should find title element', function() {
  
  return ptor.get('/').then(function(){
  	return expect(ptor.getTitle()).toEqual('angularSails');
  })



  //browser.debugger();

  	
});


})