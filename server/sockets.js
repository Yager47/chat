'use strict';

const MessageModel = require('./models/messages.model');

// .on - what you receive
// .emit - what you send

module.exports = io => {

  io.on('connection', function (socket) {
    socket.emit('connected', "You are connected.");

    // add to room
    socket.join('all');

    socket.on('msg', content => {
      const obj = {
        date: new Date(),
        content: content,
        username: socket.id
      };

      var message = new MessageModel(obj);
      message.$__save({}, (err, o) => {
        if (err) return console.error("MessageModel", err);
        socket.emit('message', o);
        socket.to('all').emit('message', o);
      });
    });

    socket.on('receiveHistory', () => {
      MessageModel
        .find({})
        .sort({date: -1})
        .limit(50)
        .sort({date: 1})
        .lean()
        .exec( (err, messages) => {
          if (!err) {
            socket.emit('history', messages);
            // socket.to('all').emit('history', messages);
          }
        })
    });

  });

};
