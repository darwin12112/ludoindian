var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var clientsocket = require('./sockets/clientsocket');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = require('http').createServer(app);
// var io = require('socket.io')(server, {'pingInterval': 500, 'pingTimeout': 25000,'rememberTransport': false,
//     'reconnect': false,
//     'secure': true});
var io = require('socket.io')(server,
  {
    transports: ['websocket'],
    allowUpgrades: false,
    pingInterval: 25000,
    pingTimeout: 60000,
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, 'delux')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

clientsocket.initdatabase();
io.on('connect', function(socket) {
  console.log("- One socket connected : ", socket.id);
  clientsocket.initsocket(socket,io);

});



module.exports = {app: app, server: server};
