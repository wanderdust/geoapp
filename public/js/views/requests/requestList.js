// View of all the request views.

var app = app || {};
var socket = socket || io();

$(function () {

  app.RequestList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      this.socket = socket;
      this.$requestList = $('.invitations-list ul')

      this.listenTo(app.requestCollection, 'add', this.appendOne);

      this.socket.on('addNewRequest', (data) => {
        app.requestCollection.add(data)
        console.log('hi')
      })
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (request) {
      let view = new app.RequestView({model: request});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    }
  })

})
