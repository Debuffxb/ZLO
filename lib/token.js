const crypto = require('crypto');
const pool = require('../lib/pool');

const algorithm = 'aes128';
const key = Buffer.from('1234567890098765', 'utf8');
const iv = Buffer.from('1234567890098765', 'utf8');

const cipher = function (buf) {
  let encrypted = '';
  const cip = crypto.createCipheriv(algorithm, key, iv);
  encrypted += cip.update(buf, 'binary', 'hex');
  encrypted += cip.final('hex');
  return encrypted;
};

const decipher = function (encrypted) {
  let decrypted = '';
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decrypted += decipher.update(encrypted, 'hex', 'binary');
  decrypted += decipher.final('binary');
  return decrypted;
};

const createToken = (id) => {
  return cipher(JSON.stringify({
    id: id,
    expire: Date.now() + 3600 * 8 * 1000
  }));
};

const checkToken = (token) => {
  let inf;
  try {
    inf = JSON.parse(decipher(token).toString());
  } catch (err) {
    return {
      err: err,
      id: null
    };
  }
  if (inf.expire < Date.now()) {
    return {
      err: 'expired',
      id: null
    };
  }
  return {
    err: null,
    id: inf.id
  };
};

const getToken = (id, callback) => {
  const sql = 'SELECT `token` FROM `zlo_token` WHERE `id` = ' + pool.escape(id);
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    if (!rows[0]) {
      return callback(new Error('此用户不存在'));
    }
    callback(null, rows[0].token);
  });
};

const updateToken = (id, callback) => {
  const sql = 'UPDATE `zlo_token` SET `token`=' + pool.escape(createToken(id)) + ' WHERE `id` = ' + pool.escape(id);
  pool.query(sql, (err) => {
    if (err) return callback(err);
    callback(null, 'success');
  });
};

const verifyToken = (token, callback) => {
  const inf = checkToken(token);
  if (inf.err) return callback(inf.err);
  getToken(inf.id, (err, _token) => {
    if (err) return callback(err);
    callback(null, token === _token, inf.id);
  });
};

module.exports = {
  createToken: createToken,
  verifyToken: verifyToken,
  updateToken: updateToken
};
