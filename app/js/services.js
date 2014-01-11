'use strict';

/* Services */

angular.module('assassinApp.services', []).


    factory('phonegapReady', function () {
        console.log('phonegapReady service');
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
      })


    .factory('geolocation', function($rootScope, phonegapReady){
        console.log('geolocation service');
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
                            },
                                                                     options);
                        })
                    };
                });