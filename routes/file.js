var express = require('express');
var fs = require('fs');
var multipart = require('connect-multiparty');


var router = express.Router();

var token = require('../lib/token');
var file = require('../lib/file');

var path = require('../config/path');

var getString = (length) => {
  var str = "";
  while(length--){
      str += String.fromCharCode(Math.round(Math.random() * 25) + 65);
  }
  return str;
}

router.get('/filelist', (req, res) => {
  let _t = req.headers['x-access-token'];
  let _p_dir = req.query.p_dir || 0;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }

  token.verify_token(_t, (err, is_effective, id) => {
    if(err) 
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      file.select_files(id, _p_dir, (err, rows) => {
        if(err)       
          return res.json({
            'status': 'forbidden',
            'info': err.message
          })
        res.json({
          status: 'success',
          data: rows
        });
      })
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

router.get('/delete', (req, res) => {
  let _t = req.headers['x-access-token'];
  let _id = req.query.id;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }
  if(!_id) {
    return res.json({
      'status': 'forbidden',
      'info': '缺少参数'
    })
  }
  token.verify_token(_t, (err, is_effective, id) => {
    if(err)
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      file.delete_file(id, _id, (err, rows) => {
        if(err)       
          return res.json({
            'status': 'forbidden',
            'info': err.message
          })
        if(rows.affectedRows != 0){
          return res.json({
            status: 'success',
          });
        }
        return res.json({
          'status': 'forbidden',
          'info': '无效文件ID'
        })
      })
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

router.get('/createdir', (req, res) => {
  let _t = req.headers['x-access-token'];
  let _name = req.query.name;
  let _p_dir = req.query.p_dir;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }
  if(!(_name && _p_dir)) {
    return res.json({
      'status': 'forbidden',
      'info': '缺少参数'
    })
  }
  token.verify_token(_t, (err, is_effective, id) => {
    if(err)
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      file.create_dir(id, _p_dir, _name, (err, rows) => {
        if(err)       
          return res.json({
            'status': 'forbidden',
            'info': err.message
          })
        if(rows.affectedRows != 0){
          return res.json({
            status: 'success',
          });
        }
        return res.json({
          'status': 'forbidden',
          'info': '无效文件夹ID'
        })
      })
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

router.post('/upload', multipart(), (req, res) => {
  let _t = req.headers['x-access-token'];
  let _file = req.files.file;
  let _p_dir = req.body.p_dir;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }
  if(!_file) {
    return res.json({
      'status': 'forbidden',
      'info': '缺少参数'
    })
  }
  token.verify_token(_t, (err, is_effective, id) => {
    if(err)
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      let filename = _file.originalFilename;
      let save_filename = id + "-" + Date.now() + "-" + getString(10) + filename.substring(filename.lastIndexOf('.'));
      fs.renameSync( _file.path, path.save_path + '/' + save_filename );
      file.upload_file(id, _p_dir, filename, save_filename, _file.size, (err, rows) => {
        if(err) {
          fs.unlink(path.save_path + '/' + save_filename, (err)=> {if(err) throw err});
          return res.json({
            'status': 'forbidden',
            'info': err.message
          })
        }
        if(rows.affectedRows != 0)
          return res.json({
            'status': 'success'
          })
        fs.unlink(path.save_path + '/' + save_filename, (err)=> {if(err) throw err});
        return res.json({
          'status': 'forbidden',
          'info': 'unknow error'
        })
      });
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

router.get('/rename', (req, res) => {
  let _t = req.headers['x-access-token'];
  let _id = req.query.id;
  let _new_name = req.query.new_name;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }
  if(!(_id && _new_name)) {
    return res.json({
      'status': 'forbidden',
      'info': '缺少参数'
    })
  }
  token.verify_token(_t, (err, is_effective, id) => {
    if(err)
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      file.rename_file(id, _new_name, _id, (err, rows) => {
        if(err)       
          return res.json({
            'status': 'forbidden',
            'info': err.message
          })
        if(rows.affectedRows != 0){
          return res.json({
            status: 'success',
          });
        }
        return res.json({
          'status': 'forbidden',
          'info': '无效文件ID'
        })
      })
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

router.get('/getfile', (req, res) => {
  let _t = req.query.token;
  let _id = req.query.id;
  if(!_t) {
    return res.json({
      'status': 'forbidden',
      'info': '鉴权失效'
    })
  }
  if(!(_id)) {
    return res.json({
      'status': 'forbidden',
      'info': '缺少参数'
    })
  }
  token.verify_token(_t, (err, is_effective, id) => {
    if(err)
      return res.json({
        'status': 'forbidden',
        'info': err.message
      })
    if(is_effective){
      file.get_file(_id, id, (err, _file) => {
        if(_file.length == 0){
          return res.json({
            'status': 'forbidden',
            'info': '没有这个文件'
          })
        }
        const header = {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment;filename=${encodeURI(_file[0].name)}`
        };
        res.writeHead(200, header);
        let file_stream = fs.createReadStream(path.save_path+'/' + _file[0].save_name);
        file_stream.pipe(res);
      });
    } else {
      return res.json({
        'status': 'forbidden',
        'info': 'unknow error'
      })
    }
  })
})

module.exports = router;