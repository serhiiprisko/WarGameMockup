
var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var logger = require('node-color-log');
// var cookieParser = require('cookie-parser');
/*
app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});
*/
// app.use(cookieParser());

app.use(cors());
app.use(bodyParser.json());
var server = require('http').createServer(app);
var port = 3100;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    var bind = 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
}

function onListening() {
    logger.info('Listening on port: ' + port);
}

module.exports = {server: server};