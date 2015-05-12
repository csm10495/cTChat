/*
This file is part of cTChat
cTChat - A simple text chat solution, written in Node.js
This is the Javascript for the chat client
(C) Charles Machalow under the MIT License
*/

//adds a message to the gui from a message object
function addMessage(msg_obj) {
	
	var padded_username = msg_obj.ip + ":";
	padded_username = padRight(padded_username, 20, "&nbsp");
	
	var newMessage = "<li><p class=username>" + padded_username + "  </p>" + msg_obj.message + "</li>";
	
	$("#chat").append(newMessage);
}

//allows for padding a string to the right
function padRight(s,l,c) {
	return s+Array(l-s.length+1).join(c||" ");
}

//scroll chat to bottom
function scrollChatToBottom() {
	$("#chat").animate({ scrollTop: $('#chat')[0].scrollHeight}, 1000);
}

//Click events must go in here
$( document ).ready(function() {	
	
	//makes the C++ programmer in me happy
	main();

	//create the WebSocket
	var sock = new WebSocket("ws://csm10495.raspctl.com:3001/");
	//signifies if a connection is open to the sock
	var connection_open = false;
	
	
	//hanlde keyups in inputbox
	$("#inputbox").keyup(function(event){
		//handle allowing enter to send the message
		if(event.keyCode == 13 && !$("#send").prop('disabled')){
			$("#send").click();
		}
		else {
			if ($("#inputbox").val() != "" && connection_open) {
				$("#send").prop('disabled', false);
			}
		}
	});
	
	//called when a connection is made
	sock.onopen = function() {
		//connection is open
		connection_open = true;
		$("#status").text("Connected to: " + sock.url);
	};
	

	//called on recv'ing a message
	sock.onmessage = function(msg_obj) {
		//must rip the msg_obj out of the MessageEvent object
		msg_obj = JSON.parse(msg_obj.data); 
		//add message to GUI
		addMessage(msg_obj);
		//scroll chat to newest
		scrollChatToBottom()
	};

	// when the socket gets closed, disable the send button
	// also alert the user if there was an error
	sock.onclose = function(closeEvent) {
		// alert the user if the shutdown was unclean
		if (!closeEvent.wasClean) {
			alert("WebSocket closed - error " + closeEvent.code);
		}
		$("#send").prop('disabled', true);
		connection_open = false;
		$("#status").text("Not Connected");
		$("#reconnect").prop('hidden', false);
	};

	// send message to the socket when the send button is clicked
	$("#send").click(function() {
		var msg = $("#inputbox").val();
		$("#inputbox").val("");
		$("#send").prop('disabled', true);
		sock.send(msg);
	});
});

//will call on startup, when ready
function main() {
	//set title
	document.title = "cTChat";

	//load existing messages
	$.get("/getmessages", function( data ) {
		//console.log(data[0].ip);
		data.forEach(function(x) {
			addMessage(x);
		}); 	
		scrollChatToBottom();
	});
}