const pool = require('../lib/pool');

const selectFiles = (userID, dir, callback) => {
  const sql = 'SELECT `id`, `name`, `size`, `is_dir` FROM `zlo_files` WHERE `owner` = ' + pool.escape(userID) + ' AND `p_dir` = ' + pool.escape(dir);
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    callback(null, JSON.parse(JSON.stringify(rows)));
  });
};

const deleteFile = (userID, fileID, callback) => {
  const sql = 'DELETE FROM `zlo_files` WHERE `id` = ' + pool.escape(fileID) + ' AND `owner` = ' + pool.escape(userID);
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

const createDir = (userID, pDir, name, callback) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    if (!rows[0]) {
      if (pDir !== 0) { return callback(new Error('无此文件夹')); };
    }
    sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`) VALUES (1, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ')';
    pool.query(sql, (err, rows) => {
      if (err) {
        if (err.message.indexOf('ER_DUP_ENTRY') !== -1) {
          return callback(new Error('重复文件夹'));
        }
        return callback(err);
      }
      callback(null, rows);
    });
  });
};

const uploadFile = (userID, pDir, name, saveName, size, callback) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    if (!rows[0]) {
      if (pDir !== 0) { return callback(new Error('无此文件夹')); };
    }
    sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`, `size`, `save_name`) VALUES (0, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ', ' + pool.escape(size) + ', ' + pool.escape(saveName) + ')';
    pool.query(sql, (err, rows) => {
      if (err) {
        if (err.message.indexOf('ER_DUP_ENTRY') !== -1) {
          return callback(new Error('重复文件名'));
        }
        return callback(err);
      }
      callback(null, rows);
    });
  });
};

const renameFile = (userID, newName, fileID, callback) => {
  const sql = 'UPDATE `zlo_files` SET `name` = ' + pool.escape(newName) + ' WHERE `owner` = ' + pool.escape(userID) + ' AND `id` = ' + pool.escape(fileID);
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

const getFile = (fileID, userID, callback) => {
  const sql = `SELECT \`save_name\`, \`name\` FROM \`zlo_files\` WHERE \`id\` = ${pool.escape(fileID)} AND \`owner\` = ${pool.escape(userID)}`;
  pool.query(sql, (err, rows) => {
    if (err) return callback(err);
    callback(rows);
  });
};

module.exports = {
  selectFiles: selectFiles,
  deleteFile: deleteFile,
  createDir: createDir,
  uploadFile: uploadFile,
  getFile: getFile,
  renameFile: renameFile
};
