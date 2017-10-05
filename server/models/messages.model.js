'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  date: {type: Date},
  content: {type: String},
  username: {type: String},

  conversationId: {
    type: Schema.Types.ObjectId,
    required: true
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'UsersModel'
  }

}, {
  versionKey: false,
  collection: "MessageCollection"
});

// const MessageSchema = new Schema({
//   date: { type: Date, default: Date.now },
//   content: String,
//   username: String
// }); 

module.exports = mongoose.model('MessageModel', MessageSchema);