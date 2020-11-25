var pool = require('../lib/pool');


const update_password = (id, password, callback) => {
  let sql = "UPDATE `zlo_user` SET `password`=" + pool.escape(password) + " WHERE `id` = " + pool.escape(id);
  pool.query(sql, (err) => {
    if(err) return callback(err);
    callback(null, 'success');
  })
}

module.exports = {
  update_password: update_password
}