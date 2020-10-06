// importing express
var express = require('express');
var app = express();
var serv = require('http').Server(app);


// preventing clients from gaining access to any files that aren't in client folder
app.get('/' , function(req,res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client' , express.static(__dirname + '/client'));

// using port 2000
serv.listen(2000);