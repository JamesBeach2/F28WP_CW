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
var sprite_list = [
	"img/playerSprite1.png",
	"/client/img/playerSprite2.png",
	"/client/img/playerSprite3.png",
	"/client/img/playerSprite4.png",
	"/client/img/playerSprite5.png",
	"/client/img/playerSprite6.png",
	"/client/img/playerSprite2_flip.png",
	"/client/img/playerSprite3_flip.png",
	"/client/img/playerSprite4_flip.png",
	"/client/img/playerSprite5_flip.png",
	"/client/img/playerSprite6_flip.png",
	"/client/img/playerSprite1_flip.png",
];




// player constructor
// some values may be unused as of right now
var Player = function(id){
	var self = {
		id: id,
		x: Math.floor(Math.random() * 1000),
		y: Math.floor(Math.random() * 1000),
		mouseX: 0,
		mouseY: 0,
		//velocity: 0,
		maxspd:0.1,
		//accel:0.5,
		size: 0,
		sprite_idx: Math.floor(Math.random() * 5),
		sprite: sprite_list[0]
	};
	
	// player movement function
	self.update_player = function(){
		// calculating player trajectory based on mouse position
		// visualised as a triangle where one end of the hypotenuse is the player object and the other is the mouse cursor
		// xDistance can be visualised as the adjacent line of the triangle and represents the size of the line between x positions of the player and cursor
		// yDistance can be visualised as the opposite line of the triangle and represents the size of the line between y positions of the player and cursor
		var xDistance = self.mouseX - self.x;
		var yDistance = self.mouseY - self.y;
		// the distance formula: √ (x2-x1)^2+(y2-y1)^2
		// (x2-x1) and (y2-y1) are represented by xDistance and yDistance
		// result is the size of the hypotenuse line which is the distance between player object and cursor
		var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
		
		// player positions only change while the mouse is further than 1 unit from the player
		// this prevents the player from spinning around the mouse
		if (distance > 1) {
			// player positions are changed relative to their x-y ratio
			// maxspd is being temporarily used as a modifier to slow the player down
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
	
	//player is added to the player list
	var player = Player(socket.id);
	player_list[socket.id] = player;
	
	console.log('Socket Connection');
	
	// player and socket info is deleted on disconnect
	socket.on('disconnect', function(){
		console.log('Player disconnected');
		delete socket_list[socket.id];
		delete player_list[socket.id];
	
	});

	// listener for updates to the mouse position
	// changes the stored player mouse values accordingly
	socket.on('update_mouse_pos', function(x,y){
		player.mouseX = x;
		player.mouseY = y;
	});
});




setInterval (function(){		// looping for every tick
	// public player information packet
	var pack = [];
	
	for(var i in player_list){
		var player = player_list[i];

		// player positions are updated
		player.update_player();
		// new player positions are pushed into the packet
		pack.push({
			x:player.x,
			y:player.y,
			image:player.sprite
		});
	}
	for(var i in socket_list){
		var socket = socket_list[i];
		// the packet is emitted to each client
		socket.emit('update_positions', pack);
	}
	
// server sends and receives data at a rate of 30 frames per second	
},1000/30);

