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

$( document ).ready( () => {

  for (let conversation of conversations) {
    addConv(conversation);
  }

  // $('.chat-message button').on('click', e => {
  //   e.preventDefault();

  //   var selector = $("textarea[name='message']");
  //   var messageContent = selector.val().trim();
  //   console.log(messageContent);
  //   if(messageContent !== '') {
  //     socket.emit('msg', messageContent);
  //     selector.val('');
  //   }
  // });

  function encodeHTML (str){
    return $('<div />').text(str).html();
  }

  function addConv(conv) {
    conv.name  = encodeHTML(conv.name);

    var html = `
      <li>
        <div class="message-data">
          <span class="message-data-name">${conv.name}</span>
        </div>
      </li>`;

    $(html).hide().appendTo('.chat-history ul').slideDown(200);

    $(".chat-history").animate({ scrollTop: $('.chat-history')[0].scrollHeight}, 1000);
  }
});