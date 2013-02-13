/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, 
unused:true, curly:true, browser:true, node:true, indent:4, maxerr:50, globalstrict:false */
/*global app:true, clients:true */

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	ws = require('websocket.io').attach(server),
	redis = require('redis'),
	clients = [];

server.listen(3000);
console.log('Listening on port 3000');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public', { /*maxAge: 3600000*/ }));

app.get('/', function(req, res) {
	res.render('index.jade');
});

app.get('/dashboard/:key?', function (req, res) {
	res.render('index.jade');
});

var sync = function (data, client) {

	var redisClient = redis.createClient(),
		key = Date.now();

	console.log(data);

	redisClient.set(key, JSON.stringify(data), redis.print);
	client.socket.send('' + key + '');
};

ws.on('connection', function (socket) {

	var client = {
		'id': (Date.now()) + '_' + Math.round(Math.random() * 100), 
		'socket': socket
	};

	var redisClient = redis.createClient();

	socket.on('message', function (res) {

		res = JSON.parse(res);

		if (res.method === 'sync') {
			sync(res.payload, client);
		} else {
			redisClient.get(res.key, function (err, data) {
				socket.send(data);
			});
		}
	});

	clients.push(client);
});