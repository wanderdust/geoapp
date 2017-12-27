// View of the whole friend-requests app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendRequests = Backbone.View.extend({
    el: '#app-container',

    template: Handlebars.compile($('#number-of-requests').html()),

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {
      let userId = sessionStorage.getItem('userId');

      this.socket = socket;
      this.$numberOfRequests = $('.requests-length');

      this.listenTo(app.requestCollection, 'update', this.render);
      this.listenTo(app.requestCollection, 'showAlert', this.snackBar);
      new app.FriendRequestList();

      this.socket.emit('createFriendRequestCollection', userId, (err, collection) => {
        if (err)
          return console.log(err);

        app.requestCollection.add(collection)
      });

      this.render();
    },

    render: function () {
      let requestsLength = app.requestCollection.length;

      this.$numberOfRequests.html(this.template({requestsLength}));
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

})
