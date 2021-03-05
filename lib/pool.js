const mysql = require('mysql');
const database = require('../config/database.json');

const pool = mysql.createPool({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
  port: database.port
});

const query = (sql, t) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(sql, t);
    conn.release();
  });
};

const escape = (str) => {
  return mysql.escape(str);
};

module.exports = {
  query: query,
  escape: escape
};
