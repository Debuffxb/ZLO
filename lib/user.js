const pool = require('../lib/pool');

const updatePassword = (id, password, callback) => {
  const sql = 'UPDATE `zlo_user` SET `password`=' + pool.escape(password) + ' WHERE `id` = ' + pool.escape(id);
  pool.query(sql, (err) => {
    if (err) return callback(err);
    callback(null, 'success');
  });
};

module.exports = {
  updatePassword: updatePassword
};
