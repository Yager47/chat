'use strict';

// const dl = require('delivery');
// const fs = require('fs');

const UsersModel = require('./models/users.model');
const MessageModel = require('./models/messages.model');

// asyncawait
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var fileUpload = require("socketio-file-upload"); 

module.exports = io => {

  io.on('connection', function (socket) {
    socket.emit('connected', "You are connected.");

    var uploader = new fileUpload();
    uploader.dir = "/";
    uploader.listen(socket);

    // var delivery = dl.listen(socket);

    // delivery.on('receive.success',function(file){
    //   var params = file.params;
    //   fs.writeFile(file.name,file.buffer, function(err){
    //     if(err){
    //       console.log('File could not be saved.');
    //     }else{
    //       console.log('File saved.');
    //     };
    //   });
    // });

    socket.join('all');

    socket.on('msg', async( (content) => {

      var username = null;
      let user = await( UsersModel.findOne({ session_id: socket.request.sessionID }).lean().exec());
      if (user != void(0)) username = user.username;
      
      const obj = {
        date: new Date(),
        content: content,
        username: username
      };

      console.log("SOCKET USEEER", socket.request.sessionID);

      var message = new MessageModel(obj);
      message.$__save({}, (err, o) => {
        if (err) return console.error("MessageModel", err);
        socket.emit('message', o);
        socket.to('all').emit('message', o);
      });
    }));

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
          }
        })
    });

  });

};
