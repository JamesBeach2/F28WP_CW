// importing express
var express = require('express');
var app = express();
var serv = require('http').Server(app);

// preventing clients from gaining access to any files that aren't in client folder
app.get('/' , function(req,res)) {
	res.sendFile(__dirname + '/client/index.html');
};
app.use('/client' , express.static(__dirname + '/client'));

// Broadcasting on port 2000 and displaying log 
serv.listen(2000);
console.log('server started')

// creating a list of connections
var socket_list = {};
var player_list = {};






// displays an alert in the console when someone attempts to connect to the server
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket)){
	
	//assigning each client a unique id and adding them to the list of socket connections
	socket.id = Math.random();
	socket_list[socket.id] = socket;
	
	var player = Player[socket.id);
	player_list[socket.id] = player;
	
	console.log('Socket Connection')
	
	socket.on('disconnect', function(){
		console.log('Player disconnected');
		delete socket_list[socket.id];
		delete player_list[player.id];
	
	}
};





var Player = function(){
	var self = {
		id:id
		x:500,
		y:500,
		speed_x:0,
		speed_y:0,
		maxspd:20,
		accel:2,
		size:size,
		sprite: TODO,
		sprite_colour: TODO
	}
	
	self.update_player = function(){
	
	
	}
	return self;
}






setInterval (function(){		// looping for every tick
	for(var i in player_list){
		var player = player_list[i];
	}
	
	for(var i in socket_list){
		var socket = socket_list[i];
	}
	
// server sends and receives data at a rate of 30 frames per second	
},1000/30);

