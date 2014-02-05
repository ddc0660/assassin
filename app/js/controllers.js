(function () {
    'use strict';

    /* Controllers */
    // TODO: probably should be stored in some sort of configuration area

    var app = angular.module('assassinApp.controllers', ['assassinApp.config']);

    app.controller('LoginCtrl', function ($scope, $http, accountService, WEB_SERVICE_URL) {
        // TODO: this really has nothing to do with logging in - should be removed
        //CheckConnectionStatus($scope);

        // this ping is just to hit the server for no real reason
        // TODO: refactor this out for an actual attempt to connect to server    
        /*$http.jsonp(WEB_SERVICE_URL + '?callback=JSON_CALLBACK').
success(function (data, status, headers, config) {
    console.info('ping succeeded');
    console.info(data);
    console.info(status);
    console.info(headers);
    console.info(config);
}).
error(function (data, status, headers, config) {
    console.error('ping failed');
    console.error(data || "request failed");
    console.error(status);
    console.error(headers);
    console.error(config);
});*/

        $scope.email = localStorage.getItem('email');
        $scope.name = localStorage.getItem('name');

        $scope.loggedIn = ($scope.email !== null && $scope.name !== null);

        $scope.login = function (name, email) {
            accountService.login(name, email);
            $scope.loggedIn = true;
        };

        $scope.logOff = function () {
            accountService.logOff();
            $scope.loggedIn = false;
        };
    });

    app.controller('LocationCtrl', function ($scope, $http, geolocation, gameService, WEB_SERVICE_URL) {
        $scope.position = null;

        geolocation.getCurrentPosition(function (position) {
            alert('Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n');
        });

        $scope.join = function () {
            gameService.joinGame();
        };

        $scope.updateLocation = function () {
            gameService.updateLocation();
        };

        $scope.findNearby = function () {
            gameService.findNearby();
        };
    });

    app.controller('GeolocationCtrl', function ($scope, $rootScope) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.position = position;
            sessionStorage.setItem('latitude', position.coords.latitude);
            sessionStorage.setItem('longitude', position.coords.longitude);
            $scope.$apply();
        }, function (e) {
            alert("Error retreiving position " +
                e.code + " " + e.message);
            console.log("Error retreiving position " +
                e.code + " " + e.message);
        });
    });

    // TODO: move to service
    function CheckConnectionStatus($scope, connection) {
        try {
            if (navigator.connection.type === Connection.NONE) {
                $scope.isNetworkAvailable = 'No Internet Access';
            } else {
                $scope.isNetworkAvailable = 'Internet Access Enabled';
            }
        } catch (e) {
            console.error('Unable to get connection type. Phonegap is either not ready or not available.');
            $scope.isNetworkAvailable = 'Unknown';
        }
    }
}());