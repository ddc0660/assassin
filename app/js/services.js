(function () {
    'use strict';

    /* Services */

    var app = angular.module('assassinApp.services', ['assassinApp.config']);

    app.factory('phonegapReady', function () {
        return function (fn) {
            var queue = [];

            var impl = function () {
                queue.push(Array.prototype.slice.call(arguments));
            };

            document.addEventListener('deviceready', function () {
                queue.forEach(function (args) {
                    fn.apply(this, args);
                });
                impl = fn;
            }, false);

            return function () {
                return impl.apply(this, arguments);
            };
        };
    });

    app.factory('geolocation', function ($rootScope, phonegapReady) {
        return {
            getCurrentPosition: phonegapReady(function (onSuccess, onError, options) {
                navigator.geolocation.getCurrentPosition(function () {
                    var that = this,
                        args = arguments;
                    if (onSuccess) {
                        $rootScope.$apply(function () {
                            onSuccess.apply(that, args);
                        });
                    }
                }, function () {
                    var that = this,
                        args = arguments;

                    if (onError) {
                        $rootScope.$apply(function () {
                            onError.apply(that, args);
                        });
                    }
                }, options);
            })
        };
    });



    app.factory('accountService', function () {
        return {
            login: function (name, email) {
                localStorage.setItem('name', name);
                localStorage.setItem('email', email);
            },
            logOff: function () {
                localStorage.removeItem('name');
                localStorage.removeItem('email');
            }
        }
    });

    app.factory('gameService', function ($http, WEB_SERVICE_URL) {
        return {
            joinGame: function () {
                var params = {
                    email: 'a',
                    name: 'b',
                    locationLat: '1',
                    locationLon: '2'
                };
                /*email: localStorage.getItem('email'),
                      name: localStorage.getItem('name'),
                      locationLat: sessionStorage.getItem('latitude'),
                      locationLon: sessionStorage.getItem('longitude')};*/
                console.log(params);
                $http.post(WEB_SERVICE_URL + "JoinGame", params)
                    .success(function (data) {
                        console.log(data);
                    });
            }
        }
    });




    // sample services begin here

    app.factory('$basicService', function () {
        return {
            exciteText: function (msg) {
                return msg + '!!!';
            }
        };
    });

    app.factory('$httpBasedService', function ($http) {
        return {
            sendMessage: function (msg) {
                return $http.get('something.json?msg=' + msg)
                    .then(function (result) {
                        return result.data;
                    });
            }
        };
    });
}());