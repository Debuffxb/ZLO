const express = require('express');
const fs = require('fs');
const multipart = require('connect-multiparty');

const router = express.Router();

const token = require('../lib/token');
const file = require('../lib/file');

const path = require('../config/path');

const getString = (length) => {
  let str = '';
  while (length--) {
    str += String.fromCharCode(Math.round(Math.random() * 25) + 65);
  }
  return str;
};

router.use(async (req, res, next) => {
  try {
    const _t = req.headers['x-access-token'] || req.query.token;
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
});

router.get('/filelist', async (req, res) => {
  const _pDir = req.query.p_dir || 0;
  const userID = req.query.user_id;
  try {
    const rows = await file.selectFiles(userID, _pDir);
    res.json({
      status: 'success',
      data: rows
    });
  } catch (err) {
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
});

router.get('/delete', async (req, res) => {
  const _id = req.query.id;
  const userID = req.query.user_id;
  if (!_id) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  try {
    await file.deleteFile(userID, _id);
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

router.get('/createdir', async (req, res) => {
  const _name = req.query.name;
  const _pDir = req.query.p_dir;
  const userID = req.query.user_id;
  if (!(_name && _pDir)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  try {
    await file.createDir(userID, _pDir, _name);
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

router.post('/upload', multipart(), async (req, res) => {
  const _file = req.files.file;
  const _pDir = req.body.p_dir;
  const userID = req.query.user_id;
  if (!(_file && _pDir)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  let saveFilename;
  try {
    const filename = _file.originalFilename;
    saveFilename = userID + '-' + Date.now() + '-' + getString(10) + filename.substring(filename.lastIndexOf('.'));
    fs.renameSync(_file.path, path.savePath + '/' + saveFilename);
    await file.uploadFile(userID, _pDir, filename, saveFilename, _file.size);
    return res.json({
      status: 'success'
    });
  } catch (err) {
    if (fs.existsSync(path.savePath + '/' + saveFilename)) {
      fs.unlink(path.savePath + '/' + saveFilename, (err) => { if (err) throw err; });
    }
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
});

router.get('/rename', async (req, res) => {
  const _id = req.query.id;
  const _newName = req.query.new_name;
  const userID = req.query.user_id;
  if (!(_id && _newName)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  try {
    await file.renameFile(userID, _newName, _id);
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

router.get('/getfile', async (req, res) => {
  const _id = req.query.id;
  const userID = req.query.user_id;
  if (!(_id)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  try {
    const rows = await file.getFile(userID, _id);
    const header = {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment;filename=${encodeURI(rows[0].name)}`
    };
    res.writeHead(200, header);
    const fileStream = fs.createReadStream(path.savePath + '/' + rows[0].save_name);
    fileStream.pipe(res);
  } catch (err) {
    return res.json({
      status: 'forbidden',
      info: err.message
    });
  }
});

module.exports = router;
