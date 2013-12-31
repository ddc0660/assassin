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

function JoinGame() {
    "use strict";
    console.log("JoinGame");
    var user = [{   "name": "David", 
                    "email": "david.d.campbell@gmail.com",
                    "locationLat": "0",
                    "locationLon": "0" }];
    console.log(JSON.stringify( {Player: user} ));
    $.ajax({
        type: "POST",
        url: webServiceURL,
        data: JSON.stringify({ User: user }),
        contentType: "application/jsonp; charset=utf-8",
        dataType: "jsonp",
        success: OnSuccess,
        failure: onError
    });
}