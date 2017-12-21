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
      this.listenTo(app.requestCollection, 'addGroup', this.addUserToGroup);
      this.listenTo(app.requestCollection, 'rejectGroup', this.removeGroup);

      this.socket.on('addNewRequest', (data) => {
        app.requestCollection.add(data);
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
    },

    addUserToGroup: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('joinGroup', requestId, (err, res) => {
        if (err)
          return console.log(err);

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res)
      })
    },

    removeGroup: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('rejectGroup', requestId, (err, res) => {
        if (err)
          return console.log(err);

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res);
      })
    }
  })

})
