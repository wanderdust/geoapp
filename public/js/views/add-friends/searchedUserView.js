// View for a single searched user.

var app = app || {};
var socket = socket || io();

$(function () {

  app.SearchedUserView = Backbone.View.extend({
    tagName: 'li',

    template: $('#user-template').html(),

    events: {
      "click .ok-tick": "sendFriendRequest"
    },

    initialize: function () {
      this.socket = socket;
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    // Adds a new friend document to the database.
    sendFriendRequest: function () {

      this.socket.emit('sendFriendRequest', {}, (data, callback) => {
        if (err)
          app.userCollection.trigger('showAlert', 'Unable to send request');

        app.userCollection.trigger('showAlert', 'Request sent succesfully')
      })
    }
  })

})
