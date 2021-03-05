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

router.get('/filelist', async (req, res) => {
  const _t = req.headers['x-access-token'];
  const _pDir = req.query.p_dir || 0;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  rows = await file.selectFiles(rows.id, _pDir);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  res.json({
    status: 'success',
    data: rows
  });
});

router.get('/delete', async (req, res) => {
  const _t = req.headers['x-access-token'];
  const _id = req.query.id;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!_id) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }

  rows = await file.deleteFile(rows.id, _id);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (rows.affectedRows !== 0) {
    return res.json({
      status: 'success'
    });
  }
  return res.json({
    status: 'forbidden',
    info: '无效文件ID'
  });
});

router.get('/createdir', async (req, res) => {
  const _t = req.headers['x-access-token'];
  const _name = req.query.name;
  const _pDir = req.query.p_dir;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!(_name && _pDir)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  rows = await file.createDir(rows.id, _pDir, _name);

  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (rows.affectedRows !== 0) {
    return res.json({
      status: 'success'
    });
  }
  return res.json({
    status: 'forbidden',
    info: '无效文件ID'
  });
});

router.post('/upload', multipart(), async (req, res) => {
  const _t = req.headers['x-access-token'];
  const _file = req.files.file;
  const _pDir = req.body.p_dir;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!(_file && _pDir)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  const filename = _file.originalFilename;
  const saveFilename = rows.id + '-' + Date.now() + '-' + getString(10) + filename.substring(filename.lastIndexOf('.'));
  fs.renameSync(_file.path, path.savePath + '/' + saveFilename);
  rows = await file.uploadFile(rows.id, _pDir, filename, saveFilename, _file.size);
  if (rows instanceof Error) {
    fs.unlink(path.savePath + '/' + saveFilename, (err) => { if (err) throw err; });
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (rows.affectedRows !== 0) {
    return res.json({
      status: 'success'
    });
  }
  fs.unlink(path.savePath + '/' + saveFilename, (err) => { if (err) throw err; });
  return res.json({
    status: 'forbidden',
    info: '无效文件ID'
  });
});

router.get('/rename', async (req, res) => {
  const _t = req.headers['x-access-token'];
  const _id = req.query.id;
  const _newName = req.query.new_name;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!(_id && _newName)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }

  rows = await file.renameFile(rows.id, _newName, _id);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (rows.affectedRows !== 0) {
    return res.json({
      status: 'success'
    });
  }
  return res.json({
    status: 'forbidden',
    info: '无效文件ID'
  });
});

router.get('/getfile', async (req, res) => {
  const _t = req.query.token;
  const _id = req.query.id;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!(_id)) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }

  let rows = await token.verifyToken(_t);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  rows = file.getFile(_id, rows.id);
  if (rows instanceof Error) {
    return res.json({
      status: 'forbidden',
      info: rows.message
    });
  }
  if (rows.length === 0) {
    return res.json({
      status: 'forbidden',
      info: '没有这个文件'
    });
  }
  const header = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment;filename=${encodeURI(rows[0].name)}`
  };
  res.writeHead(200, header);
  const fileStream = fs.createReadStream(path.savePath + '/' + rows[0].save_name);
  fileStream.pipe(res);
});

module.exports = router;
