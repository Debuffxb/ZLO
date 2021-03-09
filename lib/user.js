const pool = require('./pool');
const token = require('./token');

const updatePassword = async (id, password) => {
  const sql = 'UPDATE `zlo_user` SET `password`=' + pool.escape(password) + ' WHERE `id` = ' + pool.escape(id);
  return await pool.query(sql);
};

const login = async (username, password) => {
  const sql = 'SELECT `password`, `id` FROM `zlo_user` WHERE `username` = ' + pool.escape(username);
  const rows = await pool.query(sql);
  if (!rows[0]) {
    throw new Error('用户不存在');
  }
  if (rows[0].password !== password) {
    throw new Error('密码错误');
  }
  return await token.updateToken(rows[0].id);
};
module.exports = {
  updatePassword: updatePassword,
  login: login
};
