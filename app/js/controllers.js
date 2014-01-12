(function () {
    'use strict';

/* Controllers */
    var webServiceURL = 'http://1.code-newyears-2013.appspot.com/';

    angular.module('assassinApp.controllers', []).
    controller('LoginCtrl', function ($scope, $http) {
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
        
        $scope.login = function(name, email) {
            localStorage.setItem('name', name);
            localStorage.setItem('email', email);
            $scope.loggedIn = true;
        };
        
        $scope.logOff = function() {
            localStorage.removeItem('name');
            localStorage.removeItem('email');
            $scope.loggedIn = false;
        };
    })
    .controller('LocationCtrl', function ($scope, $http, geolocation) {
        console.log('LocationCtrl');

        geolocation.getCurrentPosition(function (position) {
            console.log('geolocation success');
            alert('Latitude: ' + position.coords.latitude + '\n' +
              'Longitude: ' + position.coords.longitude + '\n' +
              'Altitude: '  + position.coords.altitude          + '\n' +
              'Accuracy: '  + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: ' + position.coords.heading           + '\n' +
              'Speed: ' + position.coords.speed             + '\n' +
              'Timestamp: ' + position.timestamp                + '\n');
            $scope.p = 'Latitude: ' + position.coords.latitude + '<br />' +
                        'Longitude: ' + position.coords.longitude + '<br />' + 
                        'Altitude: ' + position.coords.altitude + '<br />' +
                        'Accuracy: ' + position.coords.accuracy + '<br />' +
                        'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
                        'Heading: ' + position.coords.heading + '<br />' +
                        'Speed: ' + position.coords.speed + '<br />' +
                        'Timestamp: ' + position.timestamp + '<br />';
            sessionStorage.setItem('longitude', position.coords.longitude);
            sessionStorage.setItem('latitude', position.coords.latitude);
            JoinGame($http);
        }, function () {
            console.log('geolocation failed');
            alert('geolocation failed');
        });
        
        $scope.join = function() {
            JoinGame($http);
        };
        
        $scope.updateLocation = function() {
            UpdateLocation($http);
        };
        
        $scope.findNearby = function() {
            FindNearby($http);
        };
            

            
        console.log('leaving LocationCtrl');
    });


    function JoinGame($http) {
        console.log("JoinGame");
        var params = {email: 'a',
                      name: 'b',
                      locationLat: '1',
                      locationLon: '2'};
            
            
            
            
            
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

    function UpdateLocation($http) {
        console.log("UpdateLocation");
        var params = {email: localStorage.getItem('email'),
                    locationLat: sessionStorage.getItem('latitude'),
                    locationLon: sessionStorage.getItem('longitude')};
        console.log(params);
        $http.post(webServiceURL + "UpdateLocation", params)
            .success(function (data) {
                console.log(data);
            });
    }
    
    function FindNearby($http) {
        console.log("FindNearby");
        $http.get(webServiceURL + "FindNearby", {params: {email: "david.d.campbell@gmail.com"}})
            .success(function (data) {
                console.log(data);
            });
    }
}());