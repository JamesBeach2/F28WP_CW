// importing express
var express = require('express');
var app = express();
var serv = require('http').Server(app);


// preventing clients from gaining access to any files that aren't in client folder
app.get('/' , function(req,res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client' , express.static(__dirname + '/client'));

// Broadcasting on port 2000 and displaying log 
serv.listen(2000);
console.log('server started')

// creating a list of connections
var socket_list = {};

// displays an alert in the console when someone attempts to connect to the server
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
	
	//assigning each client a unique id
	socket.id = Math.random();
	socket_list[socket.id] = socket;
	
	console.log('Socket Connection')
});

