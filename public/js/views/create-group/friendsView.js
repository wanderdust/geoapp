// View of the whole pending app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendsView = Backbone.View.extend({
    el: 'body',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .back-arrow-container": "closeNavBar",
      "click .continue-btn": "closeNavAndSave",
      "click .add-friends-btn": "openNavBar",
      "keyup .friends-query" : "search",
      "click #create-group-btn": "createNewGroup"
    },

    initialize: function () {
      this.socket = socket;
      this.groupCoords;
      this.groupFriends;
      this.groupImage = "";

      this.listenTo(app.userCollection, 'showAlert', this.snackBar);
      this.listenTo(app.userCollection, 'groupCoords', this.updateCoords);
      this.listenTo(app.userCollection, 'groupFriends', this.updateFriends);
      new app.FriendsMap();
      new app.FriendList();

    },

    render: function () {

    },

    openNavBar: function () {
      this.$('.friends-query').focus();
      this.$('.friends-query').val("");
      this.$('#sidebar-container').addClass('active');
      this.$('#app-container.group-add').addClass('active');
      app.userCollection.trigger('search');
    },

    closeNavBar: function () {
      app.userCollection.trigger('clearArray')
      this.$(".selected").removeClass('selected');
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
    },

    closeNavAndSave: function () {
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    },

    search: function () {
      app.userCollection.trigger('search');
    },

    updateCoords: function (coords) {
      this.groupCoords = coords;
    },

    updateFriends: function (friends) {
      this.groupFriends = friends;
    },

    createNewGroup: function () {
      let that = this;
      let groupData = {};
      groupData.coords = this.groupCoords;
      groupData.title = $('.title-input').val();
      groupData.friends = this.groupFriends;
      groupData.image = this.groupImage;
      groupData.currentUser = sessionStorage.getItem('userId')

      this.socket.emit('addGroup', groupData, (err, data) => {
        if (err)
          return console.log(err);

        groupData.groupId = data._id;
        that.socket.emit('addGroupRequests', groupData, (err, res) => {
          if (err)
            return console.log(err)

          window.location.href = '/main.html#/all'
        })
      });

    }
  })

})
