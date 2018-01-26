// View of the whole pending app.

var app = app || {};
var socket = socket || io.connect('https://geo-app-amigos.herokuapp.com');

$(function () {

  app.FriendsView = Backbone.View.extend({
    el: 'body',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .back-arrow-container": "closeNavAndSave",
      "click .continue-btn": "closeNavAndSave",
      "click .add-friends-btn": "openNavBar",
      "keyup .friends-query" : "search",
      "click #create-group-btn": "createNewGroup",
      "touchend .new-group-image" : "addGroupImage"
    },

    initialize: function () {
      this.socket = socket;
      this.groupCoords;
      this.groupFriends = [];
      this.groupImage = "";

      this.listenTo(app.userCollection, 'showAlert', this.snackBar);
      this.listenTo(app.userCollection, 'groupCoords', this.updateCoords);
      this.listenTo(app.userCollection, 'groupFriends', this.updateFriends);
      new app.FriendsMap();
      new app.FriendList();
      new app.AddedFriendList();

    },

    render: function () {

    },

    // Adds the class active to the sidebar to open it.
    openNavBar: function () {
      this.$('.friends-query').focus();
      this.$('.friends-query').val("");
      this.$('#sidebar-container').addClass('active');
      this.$('#app-container.group-add').addClass('active');
      app.userCollection.trigger('search');
    },

    // In the sidebar when clicked the green button saves the friends selected.
    closeNavAndSave: function () {
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
    },

    // Back to home.
    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    // For showing messages.
    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    },

    // Triggers search to show/hide users when introducing a query.
    search: function () {
      app.userCollection.trigger('search');
    },

    // Saves the coords for the group.
    updateCoords: function (coords) {
      this.groupCoords = coords;
    },

    // Saves the friends for the group in the array.
    updateFriends: function (friends) {
      this.groupFriends = friends;
    },

    // Creates a new Group in the database and sends the requests to the invited friends.
    createNewGroup: function () {
      let that = this;
      let groupData = {};
      groupData.coords = this.groupCoords;
      groupData.title = $('.title-input').val();
      groupData.friends = this.groupFriends;
      groupData.image = this.groupImage;
      groupData.currentUser = sessionStorage.getItem('userId');

      // If validation goes right, the group is created.
      if (this.groupValidation(groupData.coords, groupData.title, groupData.friends)) {
        this.socket.emit('addGroup', groupData, (err, data) => {
          if (err)
            return console.log(err);

          groupData.groupId = data._id;
          that.socket.emit('addGroupRequests', groupData, (err, res) => {
            if (err)
              return console.log(err)

            window.location.href = 'main.html#/all'
          })
        });
      }

    },

    // Checks that all fields have been filled correctly.
    groupValidation: function (coords, title, friends) {
      if (coords === undefined) {
        this.snackBar('Tienes que elegir un lugar en el mapa');
        return false;
      } else if (title.trim() === "") {
        this.snackBar('Tienes que añadir un título para el grupo');
        return false;
      } else if (friends.length === 0) {
        this.snackBar('Tienes que añadir por lo menos a 1 amigo');
        return false;
      }

      return true
    },

    addGroupImage: function () {
      let options = {
        'destinationType': 1,
        'sourceType': 0,
        'mediaType': 0,
        'correctOrientation': true
      };

      navigator.camera.getPicture(function (imageData) {
        this.groupImage = imageData;
        $('.new-group-image').html(`<img src="${imageData}">`);
      }, function (err) {
        alert('Error: '+ errorMessage );
      }, options);
    }
  })

  new app.FriendsView();
})
