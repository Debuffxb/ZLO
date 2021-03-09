const express = require('express');

const token = require('../lib/token');
const user = require('../lib/user');

const router = express.Router();

const preCheck = async (req, res, next) => {
  try {
    const _t = req.headers['x-access-token'];
    if (!_t) {
      return res.json({
        status: 'forbidden',
        info: '无权限'
      });
    }
    req.query.user_id = await token.verifyToken(_t);
  } catch (err) {
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
  next();
};

router.get('/login', async (req, res) => {
  if (!(req.query.username && req.query.password)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }
  try {
    const _t = user.login(req.query.username, req.query.password);
    res.json({
      status: 'success',
      token: _t
    });
  } catch (err) {
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
});

router.get('/editpassword', preCheck, async (req, res) => {
  const UserID = req.query.user_id;
  if (!(req.query.username && req.query.new_password)) {
    return res.json({
      status: 'forbidden',
      info: '参数不足'
    });
  }
  try {
    await user.updatePassword(UserID, req.query.new_password);
    token.updateToken(UserID);
    return res.json({
      status: 'success'
    });
  } catch (err) {
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
});

module.exports = router;
