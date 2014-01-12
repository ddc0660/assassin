(function () {
    'use strict';

/* Controllers */
    var webServiceURL = 'http://1.code-newyears-2013.appspot.com/';

    angular.module('assassinApp.controllers', []).
    controller('LoginCtrl', 
               
               function ($scope, $http) {
                   
                    $scope.isNetworkAvailable = 'Internet Access Enabled';
                   
                    if(navigator.connection.type == Connection.NONE) {
                        $scope.isNetworkAvailable = 'No Internet Access';
                    } 
                   
                   
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
            $scope.position = position;
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
            
        $scope.startTracking = function() {
            var tracking_data = [];
            var watch_id = navigator.geolocation.watchPosition(
                // Success
                function(position) {
                    tracking_data.push(position);
                },
                // Error
                function(error) {
                    console.log(error);
                },
                // Settings
                { frequency: 3000, enableHighAccuracy: true });
        };
        
        $scope.stopTracking = function() {
            // Stop tracking the user
            navigator.geolocation.clearWatch(watch_id);
	
            // Save the tracking data
            //localStorage.setItem(track_id, JSON.stringify(tracking_data));
            
            // Set the initial Lat and Long of the Google Map
            var myLatLng = new google.maps.LatLng(tracking_data[0].coords.latitude, tracking_data[0].coords.longitude);
        
            // Google Map options
            var myOptions = {
                zoom: 15,
                center: myLatLng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        
            // Create the Google Map, set options
            var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        
            var trackCoords = [];
            
            // Add each GPS entry to an array
            for(var i=0; i<tracking_data.length; i++){
                trackCoords.push(new google.maps.LatLng(tracking_data[i].coords.latitude, tracking_data[i].coords.longitude));
            }
            
            // Plot the GPS entries as a line on the Google Map
            var trackPath = new google.maps.Polyline({
                path: trackCoords,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
        
            // Apply the line to the map
            trackPath.setMap(map);
            
            // Reset watch_id and tracking_data 
            var watch_id = null;
            var tracking_data = null;
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