describe('Assassin controllers', function () {
    var $scope = null;
    var ctrl = null;

    var accountServiceMock = {
        login: function (name, email) {

        },
        logOff: function () {

        }
    };

    // indicate the module in the test
    beforeEach(module('assassinApp.controllers'));

    describe('LoginCtrl', function () {
        var sample_name = 'sample name',
            sample_email = 'sample@email.xxx';

        // set up $scope and call controller function on it
        // injecting any important bits
        beforeEach(inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $http = $injector.get('$http');

            var $controller = $injector.get('$controller');

            // now run that scope through the controller function
            // injecting any services or other injectables needed
            ctrl = $controller('LoginCtrl', {
                $scope: $scope,
                $http: $http,
                accountService: accountServiceMock
            });
        }));

        it('should have a login function', function () {
            expect(angular.isFunction($scope.login)).toBe(true);
        });

        describe('logging in', function () {
            it('should login on account service', function () {
                spyOn(accountServiceMock, 'login');
                $scope.login(sample_name, sample_email);
                expect(accountServiceMock.login).toHaveBeenCalled();
            });

            it('should set loggedIn', function () {
                $scope.loggedIn = false;
                $scope.login(sample_name, sample_email);
                expect($scope.loggedIn).toBe(true);
            });
        });

        it('should have a logOff function', function () {
            expect(angular.isFunction($scope.logOff)).toBe(true);
        })

        describe('logging off', function () {
            it('should log off on account service', function () {
                spyOn(accountServiceMock.logOff, 'logOff');
                $scope.logOff();
                expect(accountServiceMock.logOff).toHaveBeenCalled();
            });
            it('should set loggedIn to false', function () {
                $scope.loggedIn = true;
                $scope.logOff();
                expect($scope.loggedIn).toBe(false);
            })
        });
    });

    describe('LocationCtrl', function () {
        beforeEach(inject(function ($rootScope, $controller) {
            // create a scope object
            $scope = $rootScope.$new();

            // now run that scope through the controller function
            // injecting any services or other injectables needed
            ctrl = $controller('LocationCtrl', {
                $scope: $scope
            });

            describe(' NAME_GOES_HERE ', function () {

            });
        }));
    });
});