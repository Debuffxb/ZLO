const express = require('express');

const pool = require('../lib/pool');
const token = require('../lib/token');
const user = require('../lib/user');

const router = express.Router();

router.get('/login', async (req, res) => {
  if (!(req.query.username && req.query.password)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }
  let sql = 'SELECT `password`, `id` FROM `zlo_user` WHERE `username` = ' + pool.escape(req.query.username);
  let rows = await pool.query(sql);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (!rows[0]) {
    return res.json({
      status: 'forbidden',
      info: '无效用户名'
    });
  }
  if (rows[0].password !== req.query.password) {
    return res.json({
      status: 'forbidden',
      info: '密码错误'
    });
  }
  const _t = token.createToken(rows[0].id);
  sql = 'UPDATE `zlo_token` SET `token`=' + pool.escape(_t) + ' WHERE `id` = ' + pool.escape(rows[0].id);
  rows = await pool.query(sql);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  res.json({
    status: 'success',
    token: _t
  });
});

router.get('/editpassword', async (req, res) => {
  const _t = req.headers['x-access-token'];
  if (!(req.query.username && req.query.new_password && _t)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (!rows.isEffective) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  rows = await user.updatePassword(rows.id, req.query.new_password);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  rows = token.updateToken(rows.id);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  return res.json({
    status: 'success'
  });
});

module.exports = router;
