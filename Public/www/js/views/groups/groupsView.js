// View of the entire groups window.

var app = app || {};
var socket  = socket || io.connect('http://127.0.0.1:3000');


$(function () {
  app.GroupsView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click .openbtn": "openSidebar",
      "click .closebtn": "closeSidebar",
      "swipeleft #sidebar-container": "closeSidebar",
      "click .requests-btn": "getRequests",
      "click .pending-btn": "getPending",
      "click .new-group-btn": "getNewGroup",
      "click .friends-add-btn": "getAddFriends",
      "click .friend-requests-btn": "getFriendRequests",
      "click .settings-btn": "getSettings"
    },

    initialize: function () {
      _.bindAll(this, 'render', 'closeSidebar');
      this.socket = socket;
      this.$sideNav = $('#sidebar-container');

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))

      this.render();
    },

    render: function () {
      this.$sideNav.hammer();

      new app.MapsContent();
      new app.TabsContent();

      this.socket.emit('createGroupCollection', {
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if(err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // If it is a new user with no groups it triggers blankMap event.
        if (collection.length === 0) {
          app.groupCollection.trigger('blankMap')
        } else {
          app.groupCollection.add(collection);
        }
      })
    },

    openSidebar: function () {
      this.$sideNav.addClass('swipeIt');
    },

    closeSidebar: function () {
      this.$sideNav.removeClass('swipeIt');
    },

    getRequests: function () {
      window.location.href = "requests.html"
    },

    getPending: function () {
      window.location.href = "pending.html"
    },

    getNewGroup: function () {
      window.location.href = "create-group.html"
    },

    getAddFriends: function () {
      window.location.href = "add-friends.html"
    },

    getFriendRequests: function () {
      window.location.href = "friend-requests.html"
    },

    getSettings: function () {
      window.location.href = "settings.html"
    }
  })

  new app.GroupsView();
})
