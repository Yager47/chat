'use strict';

const express = require("express");
const app = express();
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server, { serveClient: true });
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chat', { useMongoClient: true }, (err) => {
  if (err) {
    console.error("DB connect error", err);
  } else {
    console.log('DB connected');
  }
});
mongoose.Promise = require('bluebird');

nunjucks.configure('./client/views', {
  autoescape: true,
  express: app
});

app.use('/assets', express.static('./client/public'));

app.get("/", (req, res) => {
  res.render('index.html', { date: new Date() });
});

require('./sockets')(io);

server.listen(7777, '0.0.0.0', () => {
  console.log('Server started on port 7777');
});