'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  name: {type: String},
  participants: [{ type: Schema.Types.ObjectId, ref: 'UsersModel'}]
}, {
  versionKey: false,
  collection: "ConversationCollection"
});

module.exports = mongoose.model('ConversationModel', ConversationSchema);