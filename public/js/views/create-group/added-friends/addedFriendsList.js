// View of all the added-friends views.

var app = app || {};
var socket = socket || io();

$(function () {

  app.AddedFriendList = Backbone.View.extend({
    el: '#added-friends-list',

    events: {
      "click .continue-btn": "saveFriendsArray",
    },

    initialize: function () {
      this.listenTo(app.userCollection, 'add', this.appendOne);
    },

    render: function () {

    },

    // Appends one model every time there is an 'add' event.
    appendOne: function (friend) {
      let view = new app.AddedFriend({model: friend});
      this.$el.append(view.render().el);
    },

    // Clears the view and appends all.
    appendAll: function (collection) {
      this.$el.html('');
      collection.each(this.appendOne, this);
    }
  })
});
