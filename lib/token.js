var crypto = require('crypto');

var pool = require('../lib/pool');

const algorithm = 'aes128'
const key = Buffer.from('1234567890098765', 'utf8');
const iv = Buffer.from('1234567890098765', 'utf8');

const cipher = function(buf) {
  var encrypted = "";
  var cip = crypto.createCipheriv(algorithm, key, iv);
  encrypted += cip.update(buf, 'binary', 'hex');
  encrypted += cip.final('hex');
  return encrypted
};

const decipher = function(encrypted) {
  var decrypted = "";
  var decipher = crypto.createDecipheriv(algorithm, key, iv);
  decrypted += decipher.update(encrypted, 'hex', 'binary');
  decrypted += decipher.final('binary');
  return decrypted
};

const create_token = (id) => {
  return cipher(JSON.stringify({
    id: id,
    expire: Date.now() + 3600 * 8 * 1000
  }))
}

const check_token = (token) => {
  let inf;
  try{
    inf = JSON.parse(decipher(token).toString());
  } catch (err){
    return {
      err: err,
      id: null
    }
  }
  if(inf.expire < Date.now()){
    return {
      err: 'expired',
      id: null
    }
  }
  return {
    err: null,
    id: inf.id
  }
}

const get_token = (id, callback) => {
  let sql = "SELECT `token` FROM `zlo_token` WHERE `id` = " + pool.escape(id);
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    if(!rows[0]){
      return callback(new Error('此用户不存在'))
    }
    callback(null, rows[0].token);
  });
}

const update_token = (id, callback) => {
  let sql = "UPDATE `zlo_token` SET `token`=" + pool.escape(create_token(id)) + " WHERE `id` = " + pool.escape(id);
  pool.query(sql, (err) => {
    if(err) return callback(err);
    callback(null, 'success');
  })
}

const verify_token = (token, callback) => {
  let inf = check_token(token);
  if(inf.err) return callback(inf.err);
  get_token(inf.id, (err, _token) => {
    if(err) return callback(err);
    callback(null, token == _token, inf.id);
  });
}

module.exports = {
  create_token: create_token,
  verify_token: verify_token,
  update_token: update_token
}