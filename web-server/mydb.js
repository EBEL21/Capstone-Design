var mysql = require('mysql');
var db = mysql.createConnection({
  host      : 'localhost',
  user     : 'root',
  password  : 'ekzmskdlxm312',
  database  : 'mydb1',
  port : '3306'
});
db.connect();
module.exports = db;
