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

      MessageModel.create(obj, err => {
        if (err) return console.error("MessageModel", err);
        socket.emit('message', obj);
        socket.to('all').emit('message', obj);
        console.log('sent', content);
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
            socket.emit("history", messages);
            socket.to('all').emit('history', messages);
          }
        })
    });

  });

};
