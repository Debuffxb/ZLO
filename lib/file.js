var pool = require('../lib/pool');
const user = require('./user');


const select_files = (user_id, dir, callback) => {
  let sql = "SELECT `id`, `name`, `size`, `is_dir` FROM `zlo_files` WHERE `owner` = " + pool.escape(user_id) + " AND `p_dir` = " + pool.escape(dir);
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    callback(null, JSON.parse(JSON.stringify(rows)));
  })
}

const delete_file = (user_id, file_id, callback) => {
  let sql = "DELETE FROM `zlo_files` WHERE `id` = " + pool.escape(file_id) + " AND `owner` = " + pool.escape(user_id);
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    callback(null, rows);
  })
}

const create_dir = (user_id, p_dir, name, callback) => {
  let sql = "SELECT `owner` FROM `zlo_files` WHERE `id` = " + pool.escape(p_dir) + " AND `owner` = " + pool.escape(user_id) + " AND `is_dir` = 1";
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    if(!rows[0]) 
      if(p_dir != 0) {return callback(new Error('无此文件夹'))};
    sql = "INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`) VALUES (1, " + pool.escape(name) + ", " + pool.escape(p_dir) + ", " + pool.escape(user_id) +  ")";
    pool.query(sql, (err, rows) => {
      if(err) {
        if(err.message.indexOf('ER_DUP_ENTRY') != -1){
          return callback(new Error('重复文件夹'));
        }
        return callback(err);
      }
      callback(null, rows);
    })
  })
}

const upload_file = (user_id, p_dir, name, save_name, size, callback) => {
  let sql = "SELECT `owner` FROM `zlo_files` WHERE `id` = " + pool.escape(p_dir) + " AND `owner` = " + pool.escape(user_id) + " AND `is_dir` = 1";
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    if(!rows[0])
      if(p_dir != 0) {return callback(new Error('无此文件夹'))};
    sql = "INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`, `size`, `save_name`) VALUES (0, " + pool.escape(name) + ", " + pool.escape(p_dir) + ", " + pool.escape(user_id) + ", " + pool.escape(size) + ", " + pool.escape(save_name) + ")";
    pool.query(sql, (err, rows) => {
      if(err) {
        if(err.message.indexOf('ER_DUP_ENTRY') != -1){
          return callback(new Error('重复文件名'));
        }
        return callback(err);
      }
      callback(null, rows);
    })
  })
}

const rename_file = (user_id, new_name, file_id, callback) => {
  let sql = "UPDATE `zlo_files` SET `name` = " + pool.escape(new_name) + " WHERE `owner` = " + pool.escape(user_id) + " AND `id` = " + pool.escape(file_id);
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    callback(null, rows);
  })
}

const get_file = (file_id, user_id, callback) => {
  let sql = `SELECT \`save_name\`, \`name\` FROM \`zlo_files\` WHERE \`id\` = ${pool.escape(file_id)} AND \`owner\` = ${pool.escape(user_id)}`;
  pool.query(sql, (err, rows) => {
    if(err) return callback(err);
    callback(null, rows);
  })
}

module.exports = {
  select_files: select_files,
  delete_file: delete_file,
  create_dir: create_dir,
  upload_file: upload_file,
  get_file: get_file,
  rename_file: rename_file
}