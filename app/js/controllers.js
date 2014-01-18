(function () {
    'use strict';

    /* Controllers */
    // TODO: probably should be stored in some sort of configuration area
    var webServiceURL = 'http://1.code-newyears-2013.appspot.com/';

    var app = angular.module('assassinApp.controllers', []);

    app.controller('LoginCtrl', function ($scope, $http, accountService) {
        // TODO: this really has nothing to do with logging in - should be removed
        CheckConnectionStatus($scope);

        // this ping is just to hit the server for no real reason
        // TODO: refactor this out for an actual attempt to connect to server    
        $http.jsonp(webServiceURL + '?callback=JSON_CALLBACK').
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

    app.controller('LocationCtrl', function ($scope, $http, geolocation) {
        console.log('test log');
        console.error('test error');
        console.info('test info');
        console.warn('test warn');

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
            JoinGame($http);
        }, function () {
            console.log('geolocation failed');
            alert('geolocation failed');
        });

        $scope.join = function () {
            JoinGame($http);
        };

        $scope.updateLocation = function () {
            UpdateLocation($http);
        };

        $scope.findNearby = function () {
            FindNearby($http);
        };

        console.log('leaving LocationCtrl');
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
    function JoinGame($http) {
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
        $http.post(webServiceURL + "JoinGame", params)
            .success(function (data) {
                console.log(data);
            });
    }

    // TODO: move to service
    function UpdateLocation($http) {
        console.log("UpdateLocation");
        var params = {
            email: localStorage.getItem('email'),
            locationLat: sessionStorage.getItem('latitude'),
            locationLon: sessionStorage.getItem('longitude')
        };
        console.log(params);
        $http.post(webServiceURL + "UpdateLocation", params)
            .success(function (data) {
                console.log(data);
            });
    }

    // TODO: move to service
    function FindNearby($http) {
        console.log("FindNearby");
        $http.get(webServiceURL + "FindNearby", {
            params: {
                email: "david.d.campbell@gmail.com"
            }
        })
            .success(function (data) {
                console.log(data);
            });
    }
}());