// importing express
var express = require('express');
var app = express();
var serv = require('http').Server(app);

// preventing clients from gaining access to any files that aren't in client folder
app.get('/' , function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client' , express.static(__dirname + '/client'));

// Broadcasting on port 2000 and displaying log 
serv.listen(2000);
console.log('server started');
var io = require('socket.io')(serv, {});

// creating a list of connections
var socket_list = {};
var player_list = {};






var Player = function(id){
	var self = {
		id: id,
		x: Math.floor(Math.random() * 1000),
		y: Math.floor(Math.random() * 1000),
		mouseX: 0,
		mouseY: 0,
		velocity: 0,
		maxspd:0.1,
		accel:0.5,
		//self.size = size;
		//self.sprite = TODO;
		//self.sprite_colour = TODO;
	};
	

	self.update_player = function(){
		var xDistance = self.mouseX - self.x;
		var yDistance = self.mouseY - self.y;
		var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
		
		if (distance > 1) {
			self.x += xDistance * self.maxspd;
			self.y += yDistance * self.maxspd;
		}
	};


	return self;
};



// displays an alert in the console when someone attempts to connect to the server
io.sockets.on('connection', function(socket){
	
	//assigning each client a unique id and adding them to the list of socket connections
	socket.id = Math.random();
	socket_list[socket.id] = socket;
	
	var player = Player(socket.id);
	player_list[socket.id] = player;
	
	console.log('Socket Connection');
	
	socket.on('disconnect', function(){
		console.log('Player disconnected');
		delete socket_list[socket.id];
		delete player_list[socket.id];
	
	});

	socket.on('update_mouse_pos', function(x,y){
		player.mouseX = x;
		player.mouseY = y;
	});
});




setInterval (function(){		// looping for every tick
	var pack = [];
	
	for(var i in player_list){
		var player = player_list[i];

		player.update_player();
		pack.push({
			x:player.x,
			y:player.y
		});
	}
	for(var i in socket_list){
		var socket = socket_list[i];
		socket.emit('update_positions', pack);
	}
	
// server sends and receives data at a rate of 30 frames per second	
},1000/30);

