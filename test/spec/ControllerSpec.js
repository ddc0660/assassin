describe("A suite", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});

describe('Testing a controller', function() {
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
    it('should start with smoketest populated', function(){
        expect($scope.smoketest).toEqual('white');
    });
});