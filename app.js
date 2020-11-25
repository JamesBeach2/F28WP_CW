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
var food_list = {};
var sprite_list = [
	"/client/img/playerSprite1.png",
	"/client/img/playerSprite2.png",
	"/client/img/playerSprite3.png",
	"/client/img/playerSprite4.png",
	"/client/img/playerSprite5.png",
	"/client/img/playerSprite6.png",
	"/client/img/playerSprite1_flip.png",
	"/client/img/playerSprite2_flip.png",
	"/client/img/playerSprite3_flip.png",
	"/client/img/playerSprite4_flip.png",
	"/client/img/playerSprite5_flip.png",
	"/client/img/playerSprite6_flip.png"
];




// player constructor
// some values may be unused as of right now
var Player = function(id){
	var self = {
		id: id,
		x: Math.floor(Math.random() * 2000),
		y: Math.floor(Math.random() * 1000),
		mouseX: 0,
		mouseY: 0,
		//velocity: 0,
		maxspd:0.02,
		//accel:0.5,
		width: 80,
		height: 44,
		sprite_idx: 0,
		sprite_idx_flip: 0,
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
		if (distance > 25) {
			// player positions are changed relative to their x-y ratio
			// maxspd is being temporarily used as a modifier to slow the player down
			self.x += xDistance * self.maxspd;
			self.y += yDistance * self.maxspd;
		}

		if (self.mouseX < self.x){
			self.sprite = sprite_list[self.sprite_idx_flip];
		}

		else if(self.x < self.mouseX){
			self.sprite = sprite_list[self.sprite_idx];
		}

		self.rotation = Math.atan2(xDistance, yDistance);
	};


	return self;
};

var Food = function(id){
	var self = {
		id: id,
		x: Math.floor(Math.random() * 2000),
		y: Math.floor(Math.random() * 1000),
		size: Math.floor((Math.random() * 20) + 5)
	};
	return self;
};

function add_food(limiter) {
	if (limiter < 50){
		var food_id = Math.random();
		var food = new Food(food_id);
		food_list[food_id] = food;
	}	
};

function check_collisions() {	
	for(var i in player_list){
		var Player = player_list[i];

		for(var j in player_list){
			var Player2 = player_list[j];
			if (Player.x > Player2.x && Player.x < Player2.x + Player2.width && Player.y > Player2.y && Player.y < Player2.y + Player2.width){
				if (Player.height > (Player2.height * 1.3)){
					Player.height += 1;
					Player.width += 1;

					Player2.height -= 1;
					Player2.width -= 1;

					if (Player2.height < 44){
						delete player_list[j];
						delete socket_list[i];
					}
				}

				else if (Player2.height > (Player1.height * 1.3)){
					Player2.height += 1;
					Player2.width += 1;

					Player.height -= 1;
					Player.width -= 1;

					if (Player.height < 44){
						delete player_list[i];
						delete socket_list[i];
					}
				}
			}	
		}

		for(var f in food_list){
			var food = food_list[f];
			if (Player.x > food.x && Player.x < food.x + food.size && Player.y > food.y && Player.y < food.y + food.size){
				Player.height += (food.size / 10);
				Player.width += (food.size / 10);
				delete food_list[f];
			}	
		}

	}
};



// displays an alert in the console when someone attempts to connect to the server
io.sockets.on('connection', function(socket){
	
	//assigning each client a unique id and adding them to the list of socket connections
	socket.id = Math.random();
	socket_list[socket.id] = socket;
	
	//player is added to the player list
	var player = Player(socket.id);
	player_list[socket.id] = player;
	player.sprite_idx = Math.floor(Math.random() * 6);
	player.sprite_idx_flip = player.sprite_idx + 6;
	player.sprite = sprite_list[player.sprite_idx];


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
	var player_pack = [];
	var food_pack = [];
	var limiter = 0;

	check_collisions();
	add_food();

	for(var i in player_list){
		var player = player_list[i];

		// player positions are updated
		player.update_player();
		// new player positions are pushed into the packet
		player_pack.push({
			x:player.x,
			y:player.y,
			player_sprite:player.sprite,
			width: player.width,
			height: player.height,
			angle: player.rotation
		});
	}

	for(var i in food_list){
		var Food = food_list[i];
		food_pack.push({
			x: Food.x,
			y: Food.y,
			size: Food.size
		});
		limiter +=1;
	}

	add_food(limiter);

	for(var i in socket_list){
		var socket = socket_list[i];
		// the packet is emitted to each client
		socket.emit('update_positions', {player_pack: player_pack, food_pack: food_pack});
	}
	
// server sends and receives data at a rate of 30 frames per second	
},1000/30);

