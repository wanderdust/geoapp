var app = app || {};

$(function () {

  app.UsersView = Backbone.View.extend({
    el: '#app-container',

    headerTemplate: Handlebars.compile($('#header-template').html()),

    onlineUsersTemplate: Handlebars.compile($('#online-user-count').html()),

    offlineUsersTemplate: Handlebars.compile($('#offline-user-count').html()),

    events: {

    },

    initialize: function () {
      this.$onlineUsers = $('.online-users-list p');
      this.$offlineUsers = $('.offline-users-list p');
      this.$header = $('#group-title-container');

      new app.UserList();

      this.listenTo(app.userCollection, 'all', _.debounce(this.render, 0));
    },

    render: function () {
      let onlineUsers = app.userCollection.onlineUsers().length;
      let offlineUsers = app.userCollection.offlineUsers().length;

      this.$onlineUsers.html(this.onlineUsersTemplate({onlineUsers}));
      this.$offlineUsers.html(this.offlineUsersTemplate({offlineUsers}))
      this.$header.html(this.headerTemplate({
        groupName: 'Group Example 1',
        status: 'online'
      }))

    }
  })

})
