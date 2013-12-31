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
    console.log(name);
    console.log(email);
    var user = [{   "name": name, 
                    "email": email,
                    "locationLat": latitude,
                    "locationLon": longitude }];
    var j = JSON.stringify( {Player: user} );
    console.log(j);
    $('#result').html(j);
    $.ajax({
        type: "POST",
        url: webServiceURL,
        data: j,
        contentType: "application/jsonp; charset=utf-8",
        dataType: "jsonp",
        success: OnSuccess,
        failure: onError
    });
}