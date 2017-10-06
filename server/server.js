'use strict';

const express = require("express");
const session = require("express-session");
const app = express();
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: true });
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);

var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore();

const passport = require('passport');
const { Strategy } = require('passport-jwt');

const { jwt } = require('./config');


var fileUpload = require("socketio-file-upload");
app.use(fileUpload.router);

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  key: 'connect.sid',
  store: sessionStore,
  secret: '64YRIEife7e7y4Ryue7r',
  saveUninitialized: true,
  resave: true
}));


io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key:          'connect.sid',
  secret:       '64YRIEife7e7y4Ryue7r',
  store:        sessionStore,
  success:      onAuthorizeSuccess,
  fail:         onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  // if(error)
  //   throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept();
}


passport.use(new Strategy(jwt, function(jwt_payload, done) {
  if (jwt_payload != void(0)) return done(false, jwt_payload); // (false) - not an error
  done();
}));

mongoose.connect('mongodb://localhost:27017/chat', { useMongoClient: true }, (err) => {
  if (err) {
    console.error("DB connect error", err);
  } else {
    console.log('DB connected');
  }
});
mongoose.Promise = require('bluebird');
mongoose.set('debug', true);

nunjucks.configure('./client/views', {
  autoescape: true,
  express: app
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json 
app.use(bodyParser.json());

app.use(cookieParser());

require('./router')(app);

require('./sockets')(io);

server.listen(7777, '0.0.0.0', () => {
  console.log('Server started on port 7777');
});