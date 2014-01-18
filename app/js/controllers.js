(function () {
    'use strict';

    /* Controllers */
    // TODO: probably should be stored in some sort of configuration area

    var app = angular.module('assassinApp.controllers', ['assassinApp.config']);

    app.controller('LoginCtrl', function ($scope, $http, accountService, WEB_SERVICE_URL) {
        // TODO: this really has nothing to do with logging in - should be removed
        CheckConnectionStatus($scope);

        // this ping is just to hit the server for no real reason
        // TODO: refactor this out for an actual attempt to connect to server    
        $http.jsonp(WEB_SERVICE_URL + '?callback=JSON_CALLBACK').
        success(function (data) {
            $scope.response = data;
        }).
        error(function (data) {
            console.error('HTTP GET failed');
        });

        $scope.email = localStorage.getItem('email');
        $scope.name = localStorage.getItem('name');

        $scope.loggedIn = ($scope.email !== null && $scope.name !== null);

        $scope.login = function (name, email) {
            accountService.login(name, email);
            $scope.loggedIn = true;
        }

        $scope.logOff = function () {
            accountService.logOff();
            $scope.loggedIn = false;
        };
    });

    app.controller('LocationCtrl', function ($scope, $http, geolocation, gameService, WEB_SERVICE_URL) {
        geolocation.getCurrentPosition(function (position) {
            console.log('geolocation success');
            alert('Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n');
            $scope.position = position;
            sessionStorage.setItem('longitude', position.coords.longitude);
            sessionStorage.setItem('latitude', position.coords.latitude);
            JoinGame($http, WEB_SERVICE_URL);
        }, function () {
            console.log('geolocation failed');
            alert('geolocation failed');
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

    // TODO: move to service
    function UpdateLocation($http, webServiceURL) {

    }

    // TODO: move to service
    function FindNearby($http, webServiceURL) {

    }
}());