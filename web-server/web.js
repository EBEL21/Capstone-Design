var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var multer = require('multer');
var db = require('./mydb.js');
var template = require('./template.js');
var fs = require('fs');
var upload = multer();
var io = require('socket.io')(server);
var dateFormat = require('dateformat');

server.listen(80);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req,res) {
	db.query("SELECT * FROM temperature",function(err,rows,cols) {
	});
	console.log(req.body);
	res.send('Hello world!');
});

app.post('/dump',upload.array(),function(req,res) {
	var jsonData = new Object();
	jsonData = JSON.parse(fs.readFileSync('data2','utf8'));
	var length = jsonData.length;
	var data = req.body.tempvalue
	var now = new Date().getTime();
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
	db.query(`INSERT INTO temperature (degree,time) VALUES (${data},NOW())`);
	if(length == 60) {
		jsonData.shift();
	}
	jsonData.push(newData);
	fs.writeFileSync('data2',JSON.stringify(jsonData),'utf8');
	var td = template.MakeTag();
  io.sockets.emit('temp',td);
	res.send({});
});

app.get('/graph',function(req,res) {
	var style = template.Style();
	var script = template.Script();
	var td = template.MakeTag();
	var html = template.HTML(style,script,td);
	db.query("SELECT * FROM temperature",function(err,datas) {
		var ary = template.MakeData(datas);
		html = html.replace("<%DATA%>",ary[0]);
		html = html.replace("<%START%>",ary[1]);
		html = html.replace("<%END%>",ary[2]);
		res.send(html);
	});
});
