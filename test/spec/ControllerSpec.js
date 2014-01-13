describe('Login controller', function() {
    var $scope = null;
    var ctrl = null;
    
    // indicate the module in the test
    beforeEach(module('assassinApp.controllers'));
    
    // set up $scope and call controller function on it
    // injecting any important bits
    beforeEach(inject(function($rootScope, $controller) {
        // create a scope object
        $scope = $rootScope.$new();
        
        // now run that scope through the controller function
        // injecting any services or other injectables needed
        ctrl = $controller('LoginCtrl', {
            $scope: $scope
        });
    }));
    
    describe('logging in', function(){
        // setup
        var sample_name = 'sample name',
            sample_email = 'sample@email.xxx';
        it('should store name and email when logging in', function() {
            // make the call
            $scope.login(sample_name, sample_email);
            
            expect(localStorage.getItem('name')).toBe(sample_name);
            expect(localStorage.getItem('email')).toBe(sample_email);
        });
        it('should set loggedIn', function(){
            // make the call
            $scope.login(sample_name, sample_email);
            
            expect($scope.loggedIn).toBe(true);
        })
    });    
});