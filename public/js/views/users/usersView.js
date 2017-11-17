// View of the whole users app.

var app = app || {};

$(function () {

  app.UsersView = Backbone.View.extend({
    el: '#app-container',

    headerTemplate: Handlebars.compile($('#header-template').html()),

    userCountTemplate: Handlebars.compile($('#user-count-template').html()),

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {
      this.$onlineUsers = $('.online-users-list p');
      this.$offlineUsers = $('.offline-users-list p');
      this.$header = $('#group-title-container');

      new app.UserList();

      this.listenTo(app.userCollection, 'all', _.debounce(this.render, 0));
    },

    // Gathers data from database and then renders it to the view.
    render: function () {
      let currentGroup = sessionStorage.getItem('currentGroup');
      let onlineUsers = app.userCollection.onlineUsers().length;
      let offlineUsers = app.userCollection.offlineUsers().length;
      let isOnline = app.userCollection.isOnline(currentGroup).isOnline;
      let pending = app.userCollection.isOnline(currentGroup).pending;

      this.$onlineUsers.html(this.userCountTemplate({
        isOnline: true,
        onlineUsers
      }));

      this.$offlineUsers.html(this.userCountTemplate({
        isOnline: false,
        offlineUsers
      }))

      this.$header.html(this.headerTemplate({
        groupName: currentGroup,
        isOnline,
        pending
      }))
    },

    backToMain: function () {
      window.location.href = '/';
    }
  })

})
