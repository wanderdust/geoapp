// View of the whole requests app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.RequestsView = Backbone.View.extend({
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
      new app.RequestList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      this.socket.emit('createRequestCollection', userId, (err, collection) => {
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
      this.$numberOfRequests.html(template({title:'Pendientes' , count}));
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
  });

  new app.RequestsView();
})
