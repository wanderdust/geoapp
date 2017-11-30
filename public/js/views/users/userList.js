// View of all the user views.

var app = app || {};

$(function () {

  app.UserList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
        this.$onlineUsers = $('.online-users-list ul');
        this.$offlineUsers = $('.offline-users-list ul');

        this.listenTo(app.userCollection, 'add', this.appendOne);
        this.listenTo(app.userCollection, 'change', this.filterOne);
    },

    render: function () {

    },

    filterOne: function (model) {
      model.trigger('updateOne', model);
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {

      let view = new app.UserView({model: user});

      if(user.get('isOnline')) {
        this.$onlineUsers.append(view.render().el);
      } else {
        this.$offlineUsers.append(view.render().el)
      }
    },

    appendAll: function (collection) {
      this.$onlineUsers.html('');
      this.$offlineUsers.html('');
      collection.each(this.appendOne, this);
    }
  })

})
