// View of the whole requests app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.RequestsView = Backbone.View.extend({
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
      new app.RequestList();

      this.socket.emit('createRequestCollection', userId, (err, collection) => {
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
    }
  })

})
