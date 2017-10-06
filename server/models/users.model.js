'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

var UsersSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(username) { return username.length >= 4 && username.length <= 128; },
      message: 'Username is too short (minimum is 4 characters)'
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(password) { return password.length >= 8 && password.length <= 128; },
      message: 'Password is too short (minimum is 8 characters)'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(email) {
        var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(email);
      },
      message: 'Wrong email format'
    }
  },
  firstName: { type: String },
  lastName: { type: String },
  session_id: {type: String, default: ''}, 
  createdAt: {type: Date, default: Date.now}
}, {
  versionKey: false,
  collection: 'UsersCollection'
});

UsersSchema.plugin(uniqueValidator);

UsersSchema.pre('save', function(next) {
  if (this.isModified('password') || this.isNew()) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});


var UsersModel = mongoose.model('UsersModel', UsersSchema);

module.exports = UsersModel;


// uniqueness validations

// UsersModel.schema.path('email').validate(function (value, respond) {
//   UsersModel.findOne({ email: value }, function (err, user) {
//       if(user) respond(false);
//   });
// }, 'This email address is already registered');

// UsersModel.schema.path('username').validate(function (value, respond) {
//   UsersModel.findOne({ username: value }, function (err, user) {
//       if(user) respond(false);
//   });
// }, 'This username is already registered');
