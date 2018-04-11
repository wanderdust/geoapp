// View of all messages.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.MessageList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      _.bindAll(this, 'loadOlderMessages')
      this.socket = socket;
      this.refreshCount = 0;

      this.listenTo(app.messageCollection, 'add', this.appendOne);
      $('#messages').on('scroll', this.loadOlderMessages)

      socket.on('newMessage', (data) => {
        app.messageCollection.add(data, {flag: true});
      })
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (message, collection, options) {
      let view = new app.MessageView({model: message});

      if (options.flag) {
        $('#messages').append(view.render().el);
        this.scrollToBottom();
      } else {
        $('#messages').prepend(view.render().el);
        // Scroll to last 'old' message
      }
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
    },

    loadOlderMessages: function () {
      let messages = $('#messages');
      // Heights
      let clientHeight = messages.prop('clientHeight');
      let scrollTop = messages.prop('scrollTop');
      let scrollHeight = messages.prop('scrollHeight');
      let messagesLength = app.messageCollection.length;
      // That means that until the length of the messages isnt as long
      // as it is supposed to be after the prepended messages, it wont
      // do another reload. 10 is the amount of messages loaded each time.
      let minListLength = 10*(this.refreshCount + 1);

      // fix last one -->
      if (scrollTop === 0 && scrollHeight > clientHeight && messagesLength >= minListLength) {
        this.refreshCount++;
        socket.emit('createMessageCollection', {
          groupId: sessionStorage.getItem('currentGroupId'),
          count: this.refreshCount
        }, (err, messages) => {
          if (err)
            return
          app.messageCollection.add(messages.reverse());
        });
      }
    }
  })

})
