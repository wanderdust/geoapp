// View for a single searched user.

var app = app || {};
var socket = socket || io.connect('http://127.0.0.1:3000');

$(function () {

  app.SearchedUserView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.userTemplateA,

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
      let recipientId = this.model.get('_id');
      let senderId = sessionStorage.getItem('userId');

      this.socket.emit('sendFriendRequest', {recipientId, senderId}, (err, res) => {
        if (err)
          return app.userCollection.trigger('showAlert', `${this.model.get('name')} ${err}`)

        app.userCollection.trigger('showAlert', res);
        this.$el.remove();
      })
    }
  })

})
