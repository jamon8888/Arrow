var express = require('express');
var app = express();

app.listen(3000);
console.log('Listening on port 3000');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public', { /*maxAge: 3600000*/ }));

app.get('/', function(reg, res) {
	res.render('index.jade');
});