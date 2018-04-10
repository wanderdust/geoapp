// View of all messages.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.ChatView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click .send-icon": "sendMessage"
    },

    initialize: function () {
      this.socket = socket;

      new app.MessageList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))
    },

    render: function () {

    },

    sendMessage: function () {
      let $messageTextBox = $('[name=message]');

      if ($messageTextBox.val().trim() === "")
        return

      let message = {
        groupId: sessionStorage.getItem('currentGroupId'),
        userId: sessionStorage.getItem('userId'),
        body: $messageTextBox.val(),
        timeStamp: new Date().getTime()
      };

      socket.emit('createMessage', message);

      $messageTextBox.val('')
    }
  })

new app.ChatView();
})
