function response (data) {
  let resp = data.responseText;
  try {
    if (data.message != void (0)) {
      resp = data.message;
    } else {
      resp = JSON.parse(data.responseText);
      resp = resp.message;
    }
  } catch (e) {}
  return resp;
}

$(".logout-btn").on('click', e => {
  e.preventDefault();
  $.ajax({
    url: '/logout',
    type: 'POST',
    data: {},
    success: (res) => {
      alert(response(res));
      location.reload();
    },
    error: (res) => {
      alert(response(res));
    }
  });
});

$(".clear-btn").on('click', e => {
  e.preventDefault();
  $.ajax({
    url: '/clear',
    type: 'POST',
    data: {},
    success: (res) => {
      alert(response(res));
      location.reload();
    },
    error: (res) => {
      alert(response(res));
    }
  });
});

$( document ).ready( () => {
  var socket = io.connect('http://localhost:7777');
  socket.on('connected', function (msg) {
    console.log(msg);
    socket.emit('receiveHistory');
  });

  // socket.on('connect', function(){
  //   var delivery = new Delivery(socket);

  //   delivery.on('delivery.connect', function (delivery) {
  //     $('.chat-message button').on('click', evt => {
  //       var file = $("input[type=file]")[0].files[0];
  //       var extraParams = {foo: 'bar'};
        
  //       delivery.send(file, extraParams);
        
  //       evt.preventDefault();
  //     });
  //   });

  //   delivery.on('send.success',function(fileUID){
  //     console.log("file was successfully sent.");
  //   });
  // });

  var uploader = new SocketIOFileUpload(socket);
  uploader.listenOnInput(document.getElementById("siofu_input"));


  socket.on('message', addMessage);

  socket.on('history', messages => {
    for (let message of messages) {
      addMessage(message);
    }
  });

  $('.chat-message button').on('click', e => {
    e.preventDefault();

    var selector = $("textarea[name='message']");
    var messageContent = selector.val().trim();
    console.log(messageContent);
    if(messageContent !== '') {
      socket.emit('msg', messageContent);
      selector.val('');
    }
  });

  function encodeHTML (str){
    return $('<div />').text(str).html();
  }

  function addMessage(message) {
    message.date    = (new Date(message.date)).toLocaleString();
    message.username  = encodeHTML(message.username);
    message.content   = encodeHTML(message.content);

    var html = `
      <li>
        <div class="message-data">
          <span class="message-data-name">${message.username}</span>
          <span class="message-data-time">${message.date}</span>
        </div>
        <div class="message my-message" dir="auto">${message.content}</div>
      </li>`;

    $(html).hide().appendTo('.chat-history ul').slideDown(200);

    $(".chat-history").animate({ scrollTop: $('.chat-history')[0].scrollHeight}, 1000);
  }
});