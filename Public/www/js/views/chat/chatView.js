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
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      socket.emit('createMessageCollection', {groupId: this.groupId, count: 0}, (err, messageList) => {
        if (err)
          return

        app.messageCollection.add(messageList.reverse())
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
