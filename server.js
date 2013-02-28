//Include
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var db = require('./db');

server.listen(8888);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/new.html', function(req, res){
	res.sendfile(__dirname + '/public/new.html');
});

app.use('/public', express.static(__dirname + '/public'));

var SerialPort = require('serialport');
var sp = SerialPort.SerialPort;
var serialPort = new sp('/dev/ttyUSB0', {
	baudrate: 115200,
	parser: SerialPort.parsers.readline("\n")
});


serialPort.on('open', function(){
	console.log('opened serial port');

	serialPort.on('data', function(data){
		var jsonData = JSON.parse(data);
		var curTime = new Date().toString();
		var tempEntry = {
			'temp': jsonData.tF,
			'time': curTime
		};
		
		db.addEntry(tempEntry);
		
	});
});


io.sockets.on('connection', function(socket){
	console.log('client connected');
	db.allRecords(socket);
	socket.on('requestData', function(){
		db.allRecords(this);
	});

	socket.on('newThermLog', function(data){
		//db.insertTherm(data);
		console.log(data);
		socket.emit('status', 'ok');
	});
});
