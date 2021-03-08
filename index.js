const express = require('express');
const app = express();
const routerUser = require('./routes/user');
const routerFile = require('./routes/file');

app.use('/user', routerUser);
app.use('/file', routerFile);

app.listen(3000, () => {
});

const gracefulShutdown = function () {
  process.exit();
};

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);
