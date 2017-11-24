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
      this.socket = io();
      this.$onlineUsers = $('.online-users-list p');
      this.$offlineUsers = $('.offline-users-list p');
      this.$header = $('#group-title-container');

      this.listenTo(app.userCollection, 'update', this.render);
      this.listenTo(app.userCollection, 'change', this.render)

      new app.UserList();
      this.socket.emit('createUsersCollection', {
        groupId: sessionStorage.getItem('currentGroupId')
      }, (err, collection) => {
        if (err)
          return console.log(err)

        app.userCollection.add(collection);
      })
    },

    // Gathers data from database and then renders it to the view.
    render: function () {
      let currentGroupName = sessionStorage.getItem('currentGroupName');
      let onlineUsers = app.userCollection.onlineUsers().length;
      let offlineUsers = app.userCollection.offlineUsers().length;
      let isOnline = app.userCollection.isStatus('online');
      let isPending = app.userCollection.isStatus('pending');

      this.$onlineUsers.html(this.userCountTemplate({
        isOnline: true,
        onlineUsers
      }));

      this.$offlineUsers.html(this.userCountTemplate({
        isOnline: false,
        offlineUsers
      }));

      this.$header.html(this.headerTemplate({
        groupName: currentGroupName,
        isOnline,
        isPending
      }));
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    }
  })

})
