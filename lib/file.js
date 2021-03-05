const pool = require('../lib/pool');

const selectFiles = async (userID, dir) => {
  const sql = 'SELECT `id`, `name`, `size`, `is_dir` FROM `zlo_files` WHERE `owner` = ' + pool.escape(userID) + ' AND `p_dir` = ' + pool.escape(dir);
  return await pool.query(sql);
};

const deleteFile = async (userID, fileID) => {
  const res = await selectFiles(userID, fileID);
  if (res instanceof Error) {
    return res;
  }
  for (const k of res) {
    await deleteFile(userID, k.id);
  }
  const sql = 'DELETE FROM `zlo_files` WHERE `id` = ' + pool.escape(fileID) + ' AND `owner` = ' + pool.escape(userID);
  return await pool.query(sql);
};

const createDir = async (userID, pDir, name) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  let res = await pool.query(sql);
  if (res instanceof Error) return res;
  if (!res[0] && pDir !== '0') return new Error('无此文件夹');
  sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`) VALUES (1, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ')';
  res = await pool.query(sql);
  if (res instanceof Error) {
    if (res.message.indexOf('ER_DUP_ENTRY') !== -1) {
      return new Error('重复文件夹');
    }
    return res;
  }
  return res;
};

const uploadFile = async (userID, pDir, name, saveName, size) => {
  let sql = 'SELECT `owner` FROM `zlo_files` WHERE `id` = ' + pool.escape(pDir) + ' AND `owner` = ' + pool.escape(userID) + ' AND `is_dir` = 1';
  let res = await pool.query(sql);
  if (res instanceof Error) return res;
  if (!res[0] && pDir !== 0) return new Error('无此文件夹');
  sql = 'INSERT INTO `zlo_files` (`is_dir`, `name`, `p_dir`, `owner`, `size`, `save_name`) VALUES (0, ' + pool.escape(name) + ', ' + pool.escape(pDir) + ', ' + pool.escape(userID) + ', ' + pool.escape(size) + ', ' + pool.escape(saveName) + ')';
  res = await pool.query(sql);
  if (res instanceof Error) {
    if (res.message.indexOf('ER_DUP_ENTRY') !== -1) {
      return new Error('重复文件夹');
    }
    return res;
  }
  return res;
};

const renameFile = async (userID, newName, fileID) => {
  const sql = 'UPDATE `zlo_files` SET `name` = ' + pool.escape(newName) + ' WHERE `owner` = ' + pool.escape(userID) + ' AND `id` = ' + pool.escape(fileID);
  return await pool.query(sql);
};

const getFile = async (fileID, userID) => {
  const sql = `SELECT \`save_name\`, \`name\` FROM \`zlo_files\` WHERE \`id\` = ${pool.escape(fileID)} AND \`owner\` = ${pool.escape(userID)}`;
  return await pool.query(sql);
};

module.exports = {
  selectFiles: selectFiles,
  deleteFile: deleteFile,
  createDir: createDir,
  uploadFile: uploadFile,
  getFile: getFile,
  renameFile: renameFile
};
