var webServiceURL = 'http://1.code-newyears-2013.appspot.com/';

function CallService() {
    "use strict";
    $.ajax({
        url: webServiceURL,
        type: "GET",
        dataType: "jsonp",
        success: OnSuccess,
        error: onError
    });
    return false;
}

function OnSuccess(data, status) {
    "use strict";
    console.log(data);
}

function onError(request, status, error) {
    "use strict";
    console.log(error);
}

function JoinGame(name, email, latitude, longitude) {
    "use strict";
    console.log("JoinGame");
    $.post(webServiceURL + "JoinGame", 
           {name: name, email: email, locationLat: latitude, locationLon: longitude}, 
           function (data) { 
            console.log(data);
        });
}

function UpdateLocation(email, latitude, longitude) {
    "use strict";
    console.log("UpdateLocation");
    $.post(webServiceURL + "UpdateLocation",
           {email: email, locationLat: latitude, locationLon: longitude}, 
           function (data) {
            console.log(data);
        });
}

function FindNearby(email) {
    "use strict";
    console.log("FindNearby");
    console.log("email: " + email);
    $.get(webServiceURL + "FindNearby",
          {email: email},
          function (data) {
            console.log("FindNearby success: " + data);
        });
}