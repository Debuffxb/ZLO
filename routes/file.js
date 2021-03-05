import { Router } from 'express';
import { renameSync, unlink, createReadStream } from 'fs';
import multipart from 'connect-multiparty';
import { verifyToken } from '../lib/token';
import { selectFiles, deleteFile, createDir, uploadFile, renameFile, getFile } from '../lib/file';
import { savePath } from '../config/path';

const router = Router();

const getString = (length) => {
  let str = '';
  while (length--) {
    str += String.fromCharCode(Math.round(Math.random() * 25) + 65);
  }
  return str;
};

router.get('/filelist', (req, res) => {
  const _t = req.headers['x-access-token'];
  const _pDir = req.query.p_dir || 0;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }

  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      selectFiles(id, _pDir, (err, rows) => {
        if (err) {
          return res.json({
            status: 'forbidden',
            info: err.message
          });
        }
        res.json({
          status: 'success',
          data: rows
        });
      });
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

router.get('/delete', (req, res) => {
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
  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      deleteFile(id, _id, (err, rows) => {
        if (err) {
          return res.json({
            status: 'forbidden',
            info: err.message
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
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

router.get('/createdir', (req, res) => {
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
  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      createDir(id, _pDir, _name, (err, rows) => {
        if (err) {
          return res.json({
            status: 'forbidden',
            info: err.message
          });
        }
        if (rows.affectedRows !== 0) {
          return res.json({
            status: 'success'
          });
        }
        return res.json({
          status: 'forbidden',
          info: '无效文件夹ID'
        });
      });
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

router.post('/upload', multipart(), (req, res) => {
  const _t = req.headers['x-access-token'];
  const _file = req.files.file;
  const _pDir = req.body.p_dir;
  if (!_t) {
    return res.json({
      status: 'forbidden',
      info: '鉴权失效'
    });
  }
  if (!_file) {
    return res.json({
      status: 'forbidden',
      info: '缺少参数'
    });
  }
  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      const filename = _file.originalFilename;
      const saveFilename = id + '-' + Date.now() + '-' + getString(10) + filename.substring(filename.lastIndexOf('.'));
      renameSync(_file.path, savePath + '/' + saveFilename);
      uploadFile(id, _pDir, filename, saveFilename, _file.size, (err, rows) => {
        if (err) {
          unlink(savePath + '/' + saveFilename, (err) => { if (err) throw err; });
          return res.json({
            status: 'forbidden',
            info: err.message
          });
        }
        if (rows.affectedRows !== 0) {
          return res.json({
            status: 'success'
          });
        }
        unlink(savePath + '/' + saveFilename, (err) => { if (err) throw err; });
        return res.json({
          status: 'forbidden',
          info: 'unknow error'
        });
      });
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

router.get('/rename', (req, res) => {
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
  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      renameFile(id, _newName, _id, (err, rows) => {
        if (err) {
          return res.json({
            status: 'forbidden',
            info: err.message
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
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

router.get('/getfile', (req, res) => {
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
  verifyToken(_t, (err, isEffective, id) => {
    if (err) {
      return res.json({
        status: 'forbidden',
        info: err.message
      });
    }
    if (isEffective) {
      getFile(_id, id, (_file) => {
        if (_file.length === 0) {
          return res.json({
            status: 'forbidden',
            info: '没有这个文件'
          });
        }
        const header = {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment;filename=${encodeURI(_file[0].name)}`
        };
        res.writeHead(200, header);
        const fileStream = createReadStream(savePath + '/' + _file[0].save_name);
        fileStream.pipe(res);
      });
    } else {
      return res.json({
        status: 'forbidden',
        info: 'unknow error'
      });
    }
  });
});

export default router;
