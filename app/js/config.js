var app = angular.module('assassinApp.config', ['ngRoute', 'assassinApp.controllers', 'google-maps'])
    .constant('WEB_SERVICE_URL', 'http://1.code-newyears-2013.appspot.com/');

app.config(['$routeProvider',
                   function ($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).
        when('/targets', {
            templateUrl: 'partials/target-list.html',
            controller: 'TargetListCtrl'
        }).
        when('/targets/:targetId', {
            templateUrl: 'partials/target-detail.html',
            controller: 'TargetDetailCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
                   }]);