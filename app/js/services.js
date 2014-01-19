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
                $http({
                    method: 'POST',
                    url: WEB_SERVICE_URL + "JoinGame",
                    params: {
                        email: localStorage.getItem('email'),
                        name: localStorage.getItem('name'),
                        locationLat: sessionStorage.getItem('latitude') || 1,
                        locationLon: sessionStorage.getItem('longitude') || 2
                    }
                })
                    .success(function (d) {
                        console.log("yay");
                    })
                    .error(function (d) {
                        console.log("nope");
                    });
            },
            updateLocation: function () {
                console.log("UpdateLocation");
                var params = {
                    email: localStorage.getItem('email'),
                    locationLat: sessionStorage.getItem('latitude') || 1,
                    locationLon: sessionStorage.getItem('longitude') || 2
                };
                console.log(params);
                $http.post(WEB_SERVICE_URL + "UpdateLocation", params)
                    .success(function (data) {
                        console.log(data);
                    });
            },
            findNearby: function () {
                console.log("FindNearby");
                $http.get(WEB_SERVICE_URL + "FindNearby", {
                    params: {
                        email: "david.d.campbell@gmail.com"
                    }
                })
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