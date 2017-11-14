var app = app || {};

$(function () {

  app.UserList = Backbone.View.extend({
    el: '.tabs-content',

    template: $('#user-template').html(),

    initialize: function () {
        this.$onlineUsers = $('.online-users-list ul');
        this.$offlineUsers = $('.offline-users-list ul');

        this.listenTo(app.userCollection, 'add', this.appendOne);
    },

    appendOne: function (user) {
      let view = new app.UserView({model: user});

      if(user.get('isOnline')) {
        this.$onlineUsers.append(view.render().el);
      } else {
        this.$offlineUsers.append(view.render().el)
      }
    }
  })

})
