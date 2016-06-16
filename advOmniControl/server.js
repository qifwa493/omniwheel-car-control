var app = require("http").createServer(handler);
var io = require("socket.io").listen(app);
var fs = require("fs");
var rpio = require("rpio");
var port = 8080;
var intervalId = [,,,];

rpio.open(31, rpio.OUTPUT, 0);
console.log("GPIO 31 opened");
rpio.open(32, rpio.OUTPUT, 0);
console.log("GPIO 32 opened");
rpio.open(33, rpio.OUTPUT, 0);
console.log("GPIO 33 opened");
rpio.open(35, rpio.OUTPUT, 0);
console.log("GPIO 35 opened");
rpio.open(36, rpio.OUTPUT, 0);
console.log("GPIO 36 opened");
rpio.open(37, rpio.OUTPUT, 0);
console.log("GPIO 37 opened");
rpio.open(38, rpio.OUTPUT, 0);
console.log("GPIO 38 opened");
rpio.open(40, rpio.OUTPUT, 0);
console.log("GPIO 40 opened");

function setPin(pin, motorId, state) {
	if(state == 0) {
		rpio.write(pin, state);
	}
	else {
		intervalId[motorId -1] = setInterval(function() {
			rpio.write(pin, 1);
			setTimeout(function() {
				rpio.write(pin, 0);
			}, 5);
		}, 20);
	}
	console.log('Pin ' + pin + ': ' + state);
}

function setMotor(motorId, state)
{
	var pin1, pin2;
	
	switch(motorId)
	{
		case 1: pin1 = 31; pin2 = 33; break;
		case 2: pin1 = 32; pin2 = 36; break;
		case 3: pin1 = 35; pin2 = 37; break;
		case 4: pin1 = 38; pin2 = 40; break;
	}
	
	clearInterval(intervalId[motorId -1]);
	if(state == 'on')
	{
		setPin(pin1, motorId, 1);
		setPin(pin2, motorId, 0);
		console.log('motor ' + motorId + ' is on!');
	}
	if(state == 'off')
	{
		setPin(pin1, motorId, 0);
		setPin(pin2, motorId, 0);
		console.log('motor ' + motorId + ' is off!');
	}
	if(state == 'back')
	{
		setPin(pin1, motorId, 0);
		setPin(pin2, motorId, 1);
		console.log('motor ' + motorId + ' is back!');
	}
}

app.listen(port);
console.log("start listening at port " + port);

function handler (req, res) {
	if (req.method == 'GET')
	{
		if (req.url == '/' || req.url == '/index.html') var reqUrl = 'index.html';
		else var reqUrl = req.url.slice(1);
		fs.readFile(reqUrl, function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end("Error loading");
			}
			
			res.writeHead(200);
			res.end(data);
		});
	}
}

io.sockets.on("connection", function (socket) {
	console.log("Connected\n");
	socket.emit("message", "Connected");
	
	socket.on("button", function (data) {
		console.log("Received: " + data);
		
		if(data == "emStop") {
			socket.emit("message", "Emergency Stop received");
			clearInterval(intervalId[0]);
			clearInterval(intervalId[1]);
			clearInterval(intervalId[2]);
			clearInterval(intervalId[3]);
			setPin(31, 1, 0);
			setPin(32, 2, 0);
			setPin(33, 1, 0);
			setPin(35, 3, 0);
			setPin(36, 2, 0);
			setPin(37, 3, 0);
			setPin(38, 4, 0);
			setPin(40, 4, 0);
		}
		if(data == "front") {
			socket.emit("message", "front received");
			setMotor(1, 'on');
			setMotor(2, 'back');
			setMotor(3, 'back');
			setMotor(4, 'on');
		}
		if(data == "stop") {
			socket.emit("message", "stop received");
			setMotor(1, 'off');
			setMotor(2, 'off');
			setMotor(3, 'off');
			setMotor(4, 'off');
		}
		if(data == "back") {
			socket.emit("message", "back received");
			setMotor(1, 'back');
			setMotor(2, 'on');
			setMotor(3, 'on');
			setMotor(4, 'back');
		}
		if(data == "left") {
			socket.emit("message", "left received");
			setMotor(1, 'on');
			setMotor(2, 'on');
			setMotor(3, 'back');
			setMotor(4, 'back');
		}
		if(data == "right") {
			socket.emit("message", "right received");
			setMotor(1, 'back');
			setMotor(2, 'back');
			setMotor(3, 'on');
			setMotor(4, 'on');
		}
		if(data == "frLe") {
			socket.emit("message", "frLe received");
			setMotor(1, 'on');
			setMotor(2, 'off');
			setMotor(3, 'back');
			setMotor(4, 'off');
		}
		if(data == "frRi") {
			socket.emit("message", "frRi received");
			setMotor(1, 'off');
			setMotor(2, 'back');
			setMotor(3, 'off');
			setMotor(4, 'on');
		}
		if(data == "baLe") {
			socket.emit("message", "baLe received");
			setMotor(1, 'off');
			setMotor(2, 'on');
			setMotor(3, 'off');
			setMotor(4, 'back');
		}
		if(data == "baRi") {
			socket.emit("message", "baRi received");
			setMotor(1, 'back');
			setMotor(2, 'off');
			setMotor(3, 'on');
			setMotor(4, 'off');
		}
		if(data == "cw") {
			socket.emit("message", "cw received");
			setMotor(1, 'back');
			setMotor(2, 'back');
			setMotor(3, 'back');
			setMotor(4, 'back');
		}
		if(data == "ccw") {
			socket.emit("message", "ccw received");
			setMotor(1, 'on');
			setMotor(2, 'on');
			setMotor(3, 'on');
			setMotor(4, 'on');
		}
		
		console.log('completed\n');
	});
});
