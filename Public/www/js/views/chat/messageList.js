// View of all messages.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.MessageList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      _.bindAll(this, 'loadOlderMessages')
      this.socket = socket;

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

      if (scrollTop === 0 && scrollHeight > clientHeight) {
        $('.chat-view').append(Templates.preloaderBlue);
        socket.emit('createMessageCollection', {
          groupId: sessionStorage.getItem('currentGroupId'),
          displayMessages: app.messageCollection.length
        }, (err, messages) => {
          if (err) {
            $('.preloader-wrapper').remove();
            return
          }

          app.messageCollection.add(messages.reverse());
          $('.preloader-wrapper').remove();
        });
      }
    }
  })

})
