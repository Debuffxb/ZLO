const pool = require('../lib/pool');

const updatePassword = async (id, password) => {
  const sql = 'UPDATE `zlo_user` SET `password`=' + pool.escape(password) + ' WHERE `id` = ' + pool.escape(id);
  return await pool.query(sql);
};
module.exports = {
  updatePassword: updatePassword
};
