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
      "click #invite-friends-btn.af": "addFriends",
      "click #exit-group-link": "confirmExit",
      "click .open-chat-btn": "getChat"
    },

    initialize: function () {
      let that = this;
      this.socket = socket;

      this.$onlineUsers = $('.online-users-list p');
      this.$offlineUsers = $('.offline-users-list p');
      this.$headerTitle = $('.group-name');
      this.$header = $('.sub-title-container');

      this.currentGroupId = sessionStorage.getItem('currentGroupId');
      // Groups name in localStorage.
      this.groupInLS = `usersCache_${this.currentGroupId}_geoApp`

      // Fast load of group title from cache.
      this.$headerTitle.html(sessionStorage.getItem('currentGroupName'));


      // menu options
      let elem = document.querySelector('.fixed-action-btn');
      let instance = M.FloatingActionButton.init(elem, {
        direction: 'bottom',
        hoverEnabled: false
      });

      this.listenTo(app.userCollection, 'all', this.render);

      new app.UserList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))

      // LoadCache loads local saved locally.
      this.loadCache();

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

          // If localStorage doesnt exist we load from http request.
          if (localStorage.getItem(this.groupInLS) === null) {
            app.userCollection.add(collection);
          } else {
            app.userCollection.reset(collection);
          }
          that.saveDataLocally(collection);
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
        isOnline,
        isPending
      }));

      // Socket.isOnline can be either false or undefined.
      if (this.socket.isOnline === false)
        $('.btn-floating').addClass('disabled');
    },

    // Loads the data from the localStorage.
    loadCache: function () {
      let cache = JSON.parse(localStorage.getItem(this.groupInLS));
      app.userCollection.add(cache);
    },

    // Saves the data from this session to the localStorage.
    saveDataLocally: function (collection) {
      let userCollection = collection.map((e) => {
        let data = {
          name: e.name,
          userImage: '',
          userStatus: e.userStatus,
          _id: e._id
        };
        return data;
      });
      userCollection = JSON.stringify(userCollection);
      localStorage.setItem(this.groupInLS, userCollection);
    },

    addFriends: function () {
      window.location.href = 'users-add-friends.html';

    },

    getChat: function () {
      window.location.href = 'chat.html'
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    confirmExit: function () {
      navigator.notification.confirm(
        '¿Estás seguro de que quieres salir permanentemente de este grupo?',
        this.exitGroup,
        'Eliminar grupo',
        ['Si', 'No']
      );
    },

    exitGroup: function (btn) {
      let remove;

      if (btn === 1) {
        remove = true;
      } else {
        remove = false;
      }

      if(!remove)
        return

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
