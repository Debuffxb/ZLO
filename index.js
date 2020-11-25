const express = require('express');
const app = express();
const router_user = require('./routes/user');
const router_file = require('./routes/file');

app.use('/user', router_user);
app.use('/file', router_file);

var server = app.listen(3000, () => {
  console.log();
})

var gracefulShutdown = function() {
  process.exit()
}

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);
