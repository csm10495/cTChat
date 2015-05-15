/*
This file is part of cTChat
cTChat - A simple text chat solution, written in Node.js
This is Node.js chat server
(C) Charles Machalow under the MIT License
*/

var express = require('express');
var ws = require('ws');
var striptags = require('striptags');

var app = express( );
app.use(express.static('public/'));
var server = app.listen(3000);
var ws_server = new ws.Server({ port: 3001 });

//people in chat
var clients = [];

//list of all messages in chat
var messages = [new msg_object(new Date(), "cTChat", "Welcome to this new chat!")];

//used to make objects that hold things like a struct
function msg_object (Date, name, msg) { 
	this.date = Date;
	this.username = name;
	this.message = msg;
}

//used to make objects that hold things like a struct for clients
//not used anywhere yet
function user_object(Date, ip_addr, name, sock, online, guid) {
	this.date = Date;
	this.ip = ip_addr;
	this.username = name;
	this.socket = sock;
	this.online = online; //is user online now (bool)
	this.guid = guid;
}

//redirect /ctchat to /ctchat.html
app.get('/ctchat', function(req, res) {
	res.redirect("ctchat.html");
});

//set the username for the current user
app.post('/setusername/:guid/:username', function(req, res) {
	var username = req.params.username;
	var guid = req.params.guid;
	console.log("setusername: " + username + " from " + req.ip + " (" + guid + ")");
	
	var success = false;
	
	clients.forEach(function(x) {
		if (x.ip == req.ip && x.guid == guid){
			x.username = username;
			success = true;
		}
	});
	
	//should not ever get false
	res.send(success);
});

//returns json of all the messages
app.get('/getmessages', function(req, res) {
	res.set('Content-Type', 'application/json');
	res.send(messages);
});

//returns json of all the users
app.get('/getusers', function(req, res) {
	res.set('Content-Type', 'application/json');

	//just get users
	var users = [];
	
	clients.forEach(function(x) {
		users.push({"username" : x.username, "online" : x.online});
	});
	
	res.send(users);
});

//connection accepted
ws_server.on('connection', function(clientSocket) {
	var connection_ip = clientSocket._socket.remoteAddress;
	console.log("new connection accepted from " + connection_ip);
	var guid = clientSocket.upgradeReq.url.substring(1);
	
	var existing_client = false;
	//check if user ip, guid already exists in clients
	clients.forEach(function(x) {
		if (x.guid == guid && x.ip == connection_ip) {
			existing_client = true;
			x.socket = clientSocket;
			x.online = true;
		}
	});
	
	if (!existing_client) {
		//clients.push(clientSocket);
		clients.push(new user_object(new Date(), connection_ip, "NAME", clientSocket, true, guid));
	}
	
	//message recv'd
	//msg is just the text, need to convert to msg_obj
	clientSocket.on('message', function(msg) {
		//strip tags from msg
		msg = striptags(msg);
		
		console.log("forwarded message: " + msg + " (" + guid + ")");
		
		var sender_name = "Unknown User";
		
		clients.forEach(function(x) {
			if (x.ip == connection_ip && x.guid == guid){
				sender_name = x.username;
			}
		});
		
		var msg_obj = new msg_object(new Date(), sender_name, msg);
		messages.push(msg_obj);
		clients.forEach(function(x) {
			//only send if online
			if (x.online) {
				x.socket.send(JSON.stringify(msg_obj));
			}
		});
	});

	//called when connection closed
	clientSocket.on('close', function() {
		//keep client but set it to not be online
		clients.forEach(function(x) {
			if (x.socket == clientSocket) {
				x.online = false;
			}
		});
		
	});
});