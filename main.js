"use strict";
console.log("Loading browser sdk");

var client = matrixcs.createClient("http://matrix.org");
client.publicRooms(function (err, data) {
    if (err) {
	   console.error("err %s", JSON.stringify(err));
       return;
    }
    console.log(data);
    console.log("Congratulations! The SDK is working on the browser!");
    var result = document.getElementById("result");
    result.innerHTML = "<p>The SDK appears to be working correctly.</p>";
});

var username = '@vkannan:matrix.org';
var password = 'passw0rd';

$.ajax({
	url: 'https://matrix.org/_matrix/client/r0/login',
	beforeSend: function(xhr){
		//xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
		console.log('send');
	},
	type: 'GET',
	dataType: 'json',
	contentType: 'application/json',
	processData: false,
	data: JSON.stringify({
		flows: {
			type: "m.login.password"
		}
	}),
	success: function(data){
		console.log('success');
		console.log(data);
	},
	error: function(err){
		console.log('error');
		console.error(err);
	}
});