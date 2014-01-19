(function () {
    'use strict';

    /* Services */

    var app = angular.module('assassinApp.services', ['assassinApp.config']);

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
}());