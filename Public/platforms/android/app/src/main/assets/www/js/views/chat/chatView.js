// View of all messages.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.ChatView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.messagesNav,

    events: {
      "click .send-icon": "sendMessage",
      "click .back-arrow": "backToGroup"
    },

    initialize: function () {
      this.socket = socket;
      this.groupId = sessionStorage.getItem('currentGroupId');
      this.userId = sessionStorage.getItem('userId');

      new app.MessageList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', {
        id: sessionStorage.getItem('userId'),
        token: sessionStorage.getItem('token')
      }, (err, res) => {
        if (err) {
          if (err.Error === 401)
            return window.location.href = 'index.html'
          return
        }
        return
      });

      socket.emit('createMessageCollection', {groupId: this.groupId, displayMessages: 0}, (err, messageList) => {
        if (err) {
          if (err.ERROR === 0) {
            window.location.href = 'main.html'
          }
        }

        // Fist time it loads normal. Appending not prepending.
        app.messageCollection.add(messageList, {flag: true})
      });

      socket.emit('getGroupInfo', {
        groupId: this.groupId,
        userId: this.userId
      }, (err, data) => {
        if (err)
          return

        this.render(data);
      })
    },

    render: function (data) {
      let template = Handlebars.compile(this.template);
      let html = template(data);

      this.$('#chat-nav-header').html(html);
      app.messageCollection.fitImage(this.$('#image-container img'));
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
    },

    backToGroup: function () {
      window.location.href = 'users.html'
    }
  })

new app.ChatView();
})
