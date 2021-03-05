const express = require('express');

const pool = require('../lib/pool');
const token = require('../lib/token');
const user = require('../lib/user');

const router = express.Router();

router.get('/login', function (req, res) {
  if (!(req.query.username && req.query.password)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }
  let sql = 'SELECT `password`, `id` FROM `zlo_user` WHERE `username` = ' + pool.escape(req.query.username);
  pool.query(sql, (err, rows) => {
    if (err) throw err;
    if (!rows[0]) {
      return res.json({
        status: 'forbidden',
        info: '无效用户名'
      });
    }
    if (rows[0].password === req.query.password) {
      const _t = token.createToken(rows[0].id);
      sql = 'UPDATE `zlo_token` SET `token`=' + pool.escape(_t) + ' WHERE `id` = ' + pool.escape(rows[0].id);
      pool.query(sql, (err) => {
        if (err) throw err;
        res.json({
          status: 'success',
          token: _t
        });
      });
    } else {
      res.json({
        status: 'forbidden',
        info: '密码错误'
      });
    }
  });
});

router.get('/editpassword', function (req, res) {
  const _t = req.headers['x-access-token'];
  if (!(req.query.username && req.query.new_password && _t)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }
  token.verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (!isEffective) {
      return res.json({
        status: 'forbidden',
        info: '鉴权失效'
      });
    }
    user.updatePassword(id, req.query.new_password, (err, isSuccess) => {
      if (err) {
        return res.json({
          status: 'forbidden',
          info: err.message
        });
      }
      if (isSuccess) {
        token.updateToken(id, (err, isSuccess) => {
          if (err) {
            return res.json({
              status: 'forbidden',
              info: err.message
            });
          }
          if (isSuccess) {
            return res.json({
              status: 'success'
            });
          }
          return res.json({
            status: 'forbidden',
            info: 'unknow error'
          });
        });
      } else {
        return res.json({
          status: 'forbidden',
          info: 'unknow error'
        });
      }
    });
  });
});

module.exports = router;
