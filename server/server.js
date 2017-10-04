'use strict';

const express = require("express");
const app = express();
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: true });
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passportSocketIo = require('passport.socketio');

const passport = require('passport');
const { Strategy } = require('passport-jwt');

const { jwt } = require('./config');

const expressSession = require("express-session");

var sessionMiddleware = expressSession({
    name: "COOKIE_NAME",
    secret: "COOKIE_SECRET_HERE",
    store: new (require("connect-mongo")(expressSession))({
        url: "mongodb://localhost:27017/chat"
    })
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// io.use(passportSocketIo.authorize({
//   key: 'connect.sid',
//   secret: "12341",
//   store: new RedisStore,
//   passport: passport,
//   cookieParser: cookieParser
// }));

passport.use(new Strategy(jwt, function(jwt_payload, done) {
  // if jwt_payload not null (this way just faster)
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