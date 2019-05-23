
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port : 3307,
  user     : 'root',
  password : '0akeorkfl!',
  database : 'fintech'
});
 
connection.connect();


var sql = 'SELECT * FROM fintech.user'
connection.query(sql, function (error, results) {
  if (error) throw error;
  console.log('user list');
  console.log(results);
});
 
connection.end();