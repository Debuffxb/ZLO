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
  const inf = JSON.parse(decipher(token).toString());
  if (inf.expire < Date.now()) {
    throw new Error('Expired');
  }
  return inf;
};

const getToken = async (id) => {
  const sql = 'SELECT `token` FROM `zlo_token` WHERE `id` = ' + pool.escape(id);
  const res = await pool.query(sql);
  if (res instanceof Error) {
    return res;
  }
  if (!res[0]) {
    return new Error('此用户不存在');
  }
  return res[0].token;
};

const updateToken = async (id) => {
  const _t = createToken(id);
  const sql = 'UPDATE `zlo_token` SET `token`=' + pool.escape(_t) + ' WHERE `id` = ' + pool.escape(id);
  await pool.query(sql);
  return _t;
};

const verifyToken = async (token) => {
  const inf = checkToken(token);
  const _token = await getToken(inf.id);
  if (!(_token === token)) {
    throw new Error('鉴权失效');
  }
  return inf.id;
};

module.exports = {
  createToken: createToken,
  verifyToken: verifyToken,
  updateToken: updateToken
};
