// View of the whole users app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.UsersView = Backbone.View.extend({
    el: '#app-container',

    headerTemplate: Templates.usersGroupHeader,

    userCountTemplate: Templates.userCount,

    events: {
      "click #back-arrow-container": "backToMain",
      "click .invite-friends-btn": "addFriends",
      "click #exit-group-link": "exitGroup"
    },

    initialize: function () {
      this.socket = socket;

      this.$onlineUsers = $('.online-users-list p');
      this.$offlineUsers = $('.offline-users-list p');
      this.$header = $('#group-title-container');

      this.listenTo(app.userCollection, 'update', this.render);
      this.listenTo(app.userCollection, 'change', this.render);

      new app.UserList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))

      this.socket.emit('createUsersCollection', {
        groupId: sessionStorage.getItem('currentGroupId'),
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        app.userCollection.add(collection);
      });

      // Listens for server if user is online/offline in a group to update it.
      this.socket.on('updateUserStatus', (data) => {
        app.userCollection.updateOnlineUser(data.userId, data.groupId);
      });

      this.socket.on('updatePendingStatus', (data) => {
        app.userCollection.updatePendingUser(data);
      });
    },

    // Gathers data from database and then renders it to the view.
    render: function () {
      let currentGroupName = sessionStorage.getItem('currentGroupName');
      let onlineUsers = app.userCollection.onlineUsers().length;
      let offlineUsers = app.userCollection.offlineUsers().length;
      let isOnline = app.userCollection.isStatus('online');
      let isPending = app.userCollection.isStatus('pending');
      let headerTemplate = Handlebars.compile(this.headerTemplate);
      let userCountTemplate = Handlebars.compile(this.userCountTemplate)

      this.$onlineUsers.html(userCountTemplate({
        isOnline: true,
        onlineUsers
      }));

      this.$offlineUsers.html(userCountTemplate({
        isOnline: false,
        offlineUsers
      }));

      this.$header.html(headerTemplate({
        groupName: currentGroupName,
        isOnline,
        isPending
      }));
    },

    addFriends: function () {
      window.location.href = 'users-add-friends.html';
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    exitGroup: function () {
      this.socket.emit('exitGroup', {
        groupId: sessionStorage.getItem('currentGroupId'),
        userId: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        window.location.href = 'main.html#/online';
      })
    }
  });

  new app.UsersView();
})
