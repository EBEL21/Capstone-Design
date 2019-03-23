var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var multer = require('multer');
var template = require('./template.js');
var fs = require('fs');
var dateFormat = require('dateformat');
var upload = multer();
var io = require('socket.io')(server);

server.listen(80);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req,res) {
	console.log(req.body);
	res.send('Hello world!');
});

app.post('/dump',upload.array(),function(req,res) {
	var jsonData = new Object();
	jsonData = JSON.parse(fs.readFileSync('data2','utf8'));
	var length = jsonData.length;
	var data = req.body.tempvalue
	var now = new Date().getTime() + (9*60*60*1000);
	var date = dateFormat(now,"yyyy/mm/dd, h:MM:ss");
	var diff = 0;
	if(length != 0){
		diff = data - jsonData[length-1].data;
	}
	var newData = {
		"data":data,
		"date":date,
		"diff":diff
	};
	if(length == 60) {
		jsonData.shift();
	}
	jsonData.push(newData);
	fs.writeFileSync('data2',JSON.stringify(jsonData),'utf8');
		var td = template.MakeTag();
        	io.sockets.emit('temp',td);
	res.send({});
});

app.get('/dump',function(req,res) {
	var style = template.Style();
	var script = template.Script();
	var td = template.MakeTag();
	var html = template.HTML(style,script,td);
	res.send(html);
});
