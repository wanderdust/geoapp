// View of all messages.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.MessageList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      this.socket = socket;

      this.listenTo(app.messageCollection, 'add', this.appendOne);

      socket.on('newMessage', (data) => {
        app.messageCollection.add(data)
      })
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (message) {
      let view = new app.MessageView({model: message});

      $('#messages').append(view.render().el);

      this.scrollToBottom();
    },

    appendAll: function (collection) {
      $('#messages').html('');
      collection.each(this.appendOne, this);
    },

    scrollToBottom: function () {
      let messages = $('#messages');
      let newMessage = messages.children('li:last-child')
      // Heights
      let clientHeight = messages.prop('clientHeight');
      let scrollTop = messages.prop('scrollTop');
      let scrollHeight = messages.prop('scrollHeight');
      let newMessageHeight = newMessage.innerHeight();
      let lastMessageHeight = newMessage.prev().innerHeight();

      if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
      }
    }
  })

})
