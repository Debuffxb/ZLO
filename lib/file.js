const pool = require('../lib/pool');
const path = require('../config/path');
const fs = require('fs');

const selectFiles = async (userID, dir) => {
  const sql = 'SELECT `id`, `name`, `size`, `is_dir` FROM `zlo_files` WHERE `owner` = ' + pool.escape(userID) + ' AND `p_dir` = ' + pool.escape(dir);
  return await pool.query(sql);
};

const deleteFile = async (userID, fileID) => {
  const row = await getFile(userID, fileID);
  if (row[0].is_dir === 1) {
    const res = await selectFiles(userID, fileID);
    for (const k of res) {
      await deleteFile(userID, k.id);
    }
  } else {
    fs.unlinkSync(path.savePath + '/' + row[0].save_name);
  }
  const sql = 'DELETE FROM `zlo_files` WHERE `id` = ' + pool.escape(fileID) + ' AND `owner` = ' + pool.escape(userID);
  const rows = await pool.query(sql);
  if (rows.affectedRows === 0) {
    throw new Error('没有这个文件');
  }
};

const createDir = async (userID, pDir, name) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  let res = await pool.query(sql);
  if (res instanceof Error) return res;
  if (!res[0] && pDir !== '0') return new Error('无此文件夹');
  sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`) VALUES (1, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ')';
  res = await pool.query(sql);
  if (res.message.indexOf('ER_DUP_ENTRY') !== -1) {
    throw new Error('重复文件夹');
  }
};

const uploadFile = async (userID, pDir, name, saveName, size) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  let res = await pool.query(sql);
  if (!res[0] && pDir !== '0') {
    throw new Error('无此文件夹');
  }
  sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`, `size`, `save_name`) VALUES (0, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ', ' + pool.escape(size) + ', ' + pool.escape(saveName) + ')';
  res = await pool.query(sql);
  if (res.message.indexOf('ER_DUP_ENTRY') !== -1) {
    throw new Error('重复文件名');
  }
};

const renameFile = async (userID, newName, fileID) => {
  const sql = 'UPDATE `zlo_files` SET `name` = ' + pool.escape(newName) + ' WHERE `owner` = ' + pool.escape(userID) + ' AND `id` = ' + pool.escape(fileID);
  const rows = pool.query(sql);
  if (rows.affectedRows === 0) {
    throw new Error('没有这个文件');
  }
};

const getFile = async (userID, fileID) => {
  const sql = `SELECT \`save_name\`, \`name\`, \`is_dir\` FROM \`zlo_files\` WHERE \`id\` = ${pool.escape(fileID)} AND \`owner\` = ${pool.escape(userID)}`;
  const rows = await pool.query(sql);
  if (rows.length === 0) {
    throw new Error('没有这个文件');
  }
  return rows;
};

module.exports = {
  selectFiles: selectFiles,
  deleteFile: deleteFile,
  createDir: createDir,
  uploadFile: uploadFile,
  getFile: getFile,
  renameFile: renameFile
};
