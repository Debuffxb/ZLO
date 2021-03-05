const mysql = require('mysql');
const database = require('../config/database.json');

const pool = mysql.createPool({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
  port: database.port
});

const query = async (sql) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      conn.query(sql, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
      conn.release();
    });
  }).catch(err => err);
};

const escape = (str) => {
  return mysql.escape(str);
};

module.exports = {
  query: query,
  escape: escape
};
