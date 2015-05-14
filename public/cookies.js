/*
This file is part of cTChat
cTChat - A simple text chat solution, written in Node.js
This is JavaScript for handling browser cookies
Some of this is based on code from W3Schools
(C) Charles Machalow under the MIT License
*/

/*
Sets a browser cookie
Takes a name, value, number of days till expiration
*/
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

/*
Returns value for a cookie
*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}