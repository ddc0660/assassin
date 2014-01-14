describe('Assassin services', function () {
    var svc;

    describe('Account Service', function () {
        beforeEach(function () {
            module('assassinApp.services');
            inject(function (accountService) {
                svc = accountService;
            });
        });

        it('should have a login() function', function () {
            expect(angular.isFunction(svc.login)).toBe(true);
        });

        describe('login()', function () {
            it('should store name and email to localStorage', function () {
                var sample_name = 'sample name',
                    sample_email = 'sample@email.abc';

                svc.login(sample_name, sample_email);

                expect(localStorage.getItem('name')).toBe(sample_name);
                expect(localStorage.getItem('email')).toBe(sample_email);
            });

            afterEach(function () {
                localStorage.clear();
            })
        });
    });
});

// begin sample service tests

describe('$basicService tests', function () {
    var basicSvc;

    // executed before each "it" is run
    beforeEach(function () {
        //load the module
        module('assassinApp.services');

        //inject your service for testing
        inject(function ($basicService) {
            basicSvc = $basicService;
        });
    });

    // check to see if it has the expected function
    it('should have an exciteText function', function () {
        expect(angular.isFunction(basicSvc.exciteText)).toBe(true);
    });

    // check to see if it does what it's supposed to do
    it('should make text exciting', function () {
        var result = basicSvc.exciteText('bar');
        expect(result).toBe('bar!!!');
    });
});

describe('$httpBasedService tests', function () {
    var svc,
        httpBackend;

    beforeEach(function () {
        module('assassinApp.services');
        inject(function ($httpBackend, $httpBasedService) {
            svc = $httpBasedService;
            httpBackend = $httpBackend;
        });
    });

    // make sure no expectations were missed in your tests
    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should send the msg and return the response', function () {
        // set up some data for the http call to return and test later
        var returnData = {
            excited: true
        };

        // expectGET to make sure this is called once
        httpBackend.expectGET('something.json?msg=wee').respond(returnData);

        // create an object with a function to spy on
        var test = {
            handler: function () {}
        };

        // set up a spy for the callback handler
        spyOn(test, 'handler');

        // make the call
        var returnedPromise = svc.sendMessage('wee');

        // use the handler you're spying on to handle the resolution of the promise
        returnedPromise.then(test.handler);

        // flush the backend to "execute" the request to do the expectedGET assertion
        httpBackend.flush();

        // check your spy to see if it's been called with the returned value
        expect(test.handler).toHaveBeenCalledWith(returnData);
    });
});