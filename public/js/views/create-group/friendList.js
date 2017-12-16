// View of all the friend views.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendList = Backbone.View.extend({
    el: '.tabs-content',

    events: {

    },

    initialize: function () {
      this.socket = socket;
      this.$requestList = $('.groups-list ul');

      this.listenTo(app.userCollection, 'add', this.appendOne);

      this.socket.emit('createUsersCollection', {
        groupId: sessionStorage.getItem('currentGroupId'),
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if (err)
          return console.log(err)

        app.userCollection.add(collection);
      });
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let view = new app.FriendView({model: group});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    }
  })
});
