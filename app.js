/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, 
unused:true, curly:true, browser:true, node:true, indent:4, maxerr:50, globalstrict:false */
/*global app:true, clients:true */

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	ws = require('websocket.io').attach(server),
	redis = require('redis'),
	clients = [];

// are we running the server in production or in developement
if ('development' === app.get('env')) {
	server.listen(3000);
	console.log('Listening to port 3000 in DEVELOPMENT mode');
} else {
	server.listen(8082);
	console.log('Listening to port 8080 in PRODUCTION mode');
}

// set up for Jade
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public', { /*maxAge: 3600000*/ }));

// load the root
app.get('/', function(req, res) {
	res.render('index.jade');
});

// are we loading up a dashboard
app.get('/dashboard/:key?', function (req, res) {
	res.render('index.jade');
});

// unquie id generator, taken from underscore.js
var unique = function () {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

/**
 * Client is uploading data to share it
 * 
 * @param  {Object} data   The transport data
 * @param  {Object} client The client
 */
var sync = function (data, client) {

	var redisClient = redis.createClient(),
		key = unique() + '-' + unique() + '-' + unique() + '-' + unique();

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