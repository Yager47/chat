'use strict';

const express = require('express');
const passport = require('passport');
const UsersModel = require('./models/users.model');
const MessagesModel = require('./models/messages.model');
const _ = require('lodash');
const config = require('./config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// asyncawait
var async = require('asyncawait/async');
var await = require('asyncawait/await');


function checkAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
    if (jwtError != void(0) || err != void(0)) return res.render('index.html', { error: err || jwtError });
    req.user = decryptToken;
    next();
  })(req, res, next);
}

function createToken (body) {
  return jwt.sign(
    body,
    config.jwt.secretOrKey,
    { expiresIn: config.expiresIn }
  );
}

module.exports = app => {
  app.use('/assets', express.static('./client/public'));

  app.get('/', checkAuth, (req, res) => {
    res.render('index.html', { date: new Date(), username: req.user.username });
  });

  app.post('/login', async( (req, res) => {
      try {
        let user = await( UsersModel.findOne({ username: {$regex: _.escapeRegExp(req.body.username), $options: "i"} }).lean().exec());  
        if (user != void(0) && bcrypt.compareSync(req.body.password, user.password)) {
          const token = createToken({id: user._id, username: user.username});
  
          res.cookie('token', token, {
            httpOnly: true
          });
          res.status(200).send({message: "User logged in successfully."});
        } else {
          res.status(400).send({message: "User not exists or password is not correct."});
        }
      }
      catch (e) {
        console.error('E, login,', e);
        res.status(500).send({message: "Server error."});
      }
    }));

  app.post('/register', async( (req, res) => {
      try {
        let user = await( UsersModel.findOne({ username: {$regex: _.escapeRegExp(req.body.username), $options: "i"} }).lean().exec());
        if (user != void(0)) {
          return res.status(400).send({message: "User already exists."});
        }
  
        user = await( UsersModel.create({
                username: req.body.username,
                password: req.body.password
              }));
  
        const token = createToken({id: user._id, username: user.username});
  
        res.cookie('token', token, {
          httpOnly: true
        });
  
        res.status(200).send({message: "User created."});
      }
      catch (e) {
        console.error('E, register,', e);
        res.status(500).send({message: "Server error."});
      }
    }));

  app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({message: "Logged out successfully."});
  });

  // app.post('/clear', (req, res) => {
  //   MessagesModel.remove({}, function (e) {});
  //   res.redirect('/');
  // });

};