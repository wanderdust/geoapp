// View of the whole requests app.

var app = app || {};

$(function () {

  app.RequestsView = Backbone.View.extend({
    el: '#app-container',

    template: Handlebars.compile($('#number-of-requests').html()),

    events: {

    },

    initialize: function () {

      this.$numberOfRequests = $('.requests-length');

      this.listenTo(app.requestCollection, 'update', this.render);

      new app.RequestList();

      this.render();
    },

    render: function () {
      let requestsLength = app.requestCollection.length;

      this.$numberOfRequests.html(this.template({requestsLength}));
    }
  })

})
