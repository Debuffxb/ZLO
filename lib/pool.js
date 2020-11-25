var mysql = require('mysql');
var database = require('../config/database.json');


var pool = mysql.createPool({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
  port: database.port
})


var query = (sql, t) => {
  pool.getConnection((err,conn) => {
    if(err) throw err;
    conn.query(sql, t);
    conn.release();
  });
}

var escape = (str) => {
  return mysql.escape(str);
} 

module.exports = {
  query: query,
  escape: escape
}