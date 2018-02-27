// View of the whole friend-requests app.

var app = app || {};
var socket = socket || io.connect('http://127.0.0.1:3000');

$(function () {

  app.FriendRequests = Backbone.View.extend({
    el: '#app-container',

    template: Templates.listCount,

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

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))

      this.socket.emit('createFriendRequestCollection', userId, (err, collection) => {
        if(err){
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );
        } else if (collection.length === 0) {
          app.requestCollection.trigger('addPlaceHolder')
        }

        app.requestCollection.add(collection)
      });

      this.render();
    },

    render: function () {
      let count = app.requestCollection.length;

      let template = Handlebars.compile(this.template);
      this.$numberOfRequests.html(template({title:'Peticiones de amistad', count}));
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

  new app.FriendRequests();
})
