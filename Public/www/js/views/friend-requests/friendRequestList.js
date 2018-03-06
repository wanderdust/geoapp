// View of all the friend-request views.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.FriendRequestList = Backbone.View.extend({
    el: '.tabs-content',

    template: Templates.contentPlaceholder,

    initialize: function () {
      this.socket = socket;
      this.$requestList = $('.invitations-list ul')

      this.listenTo(app.requestCollection, 'add', this.appendOne);
      this.listenTo(app.requestCollection, 'add remove addPlaceHolder', this.render);
      this.listenTo(app.requestCollection, 'addFriend', this.addFriend);
      this.listenTo(app.requestCollection, 'rejectFriend', this.removeFriend);

      // Adds a new request in real time.
      this.socket.on('addNewFriendRequest', (data) => {
        app.requestCollection.add(data);
      });
    },

    render: function () {
      let content = $('.invitations-list ul').html().trim();
      // Placeholder.
      if (content === "") {
        let template = Handlebars.compile(this.template);
        let html = template({placeholder: 'No tienes peticiones de amistad'});

        this.$el.append(html);
        return this;
      } else {
        $('.empty-list-placeholder').remove();
      }
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (request) {
      let view = new app.FriendRequestView({model: request});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    },

    // Adds friend to friend-list.
    addFriend: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('addFriend', requestId, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res)
      })
    },

    // Rejects the friendship request.
    removeFriend: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('rejectFriend', requestId, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res);
      })
    }
  })

})
