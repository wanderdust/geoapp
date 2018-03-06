// View of the whole friends/users app.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.FriendsView = Backbone.View.extend({
    el: 'body',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .back-arrow-container.cg": "closeNavAndSave",
      "click .back-arrow-container.af": "backToUsers",
      "click .continue-btn.cg": "closeNavAndSave",
      "click .continue-btn.af": "sendInvitation",
      "click .add-friends-btn": "openNavBar",
      "keyup .friends-query" : "search",
      "click #create-group-btn": "createNewGroup",
      "touchend .new-group-image" : "addGroupImage",
      "swiperight .tabs-content": "closeNavAndSave"
    },

    initialize: function () {
      this.socket = socket;
      this.groupCoords;
      this.groupFriends = [];
      this.groupImage = "";
      this.$sideNav = $('.status-users-content');
      _.bindAll(this, 'addGroupImage')

      this.listenTo(app.userCollection, 'showAlert', this.snackBar);
      this.listenTo(app.userCollection, 'groupCoords', this.updateCoords);
      this.listenTo(app.userCollection, 'groupFriends', this.updateFriends);

      new app.FriendList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'))

      if (this.getUrl() === "create-group.html") {
        new app.FriendsMap();
        new app.AddedFriendList();
      }

      this.render();
    },

    render: function () {
      this.$sideNav.hammer();
    },

    // Gets the url of the current document to use only some of the js/files
    getUrl: function () {
      let file = window.location.href.split('/').pop();
      return file.split('#').shift();
    },

    // Adds the class active to the sidebar to open it.
    openNavBar: function () {
      this.$('.friends-query').focus();
      this.$('.friends-query').val("");
      this.$('#sidebar-container').addClass('active');
      this.$('#app-container.group-add').addClass('active');
      this.$el.addClass('scroll-fix');
      app.userCollection.trigger('search');
    },

    // In the sidebar when clicked the green button saves the friends selected.
    closeNavAndSave: function () {
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
      this.$('.friends-query').blur();
      // sets overflow to hidden
      this.$el.removeClass('scroll-fix');
    },

    // go back to the users (users.html)
    backToUsers: function () {
      window.location.href = 'users.html';
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

    sendInvitation: function () {
      let groupData = {};
      groupData.friends = this.groupFriends;
      groupData.image = this.groupImage;
      groupData.currentUser = sessionStorage.getItem('userId');
      groupData.groupId = sessionStorage.getItem('currentGroupId');

      this.socket.emit('addGroupRequests', groupData, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        $('.selected').hide();
        window.location.href = 'users.html';
      })
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
            return navigator.notification.alert(
              err,
              (msg) => true,
              'Error'
            );

          groupData.groupId = data._id;
          that.socket.emit('addGroupRequests', groupData, (err, res) => {
            if (err)
              return navigator.notification.alert(
                err,
                (msg) => true,
                'Error'
              );

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
      let that = this;
      let options = {
        'destinationType': 1,
        'sourceType': 0,
        'mediaType': 0,
        'correctOrientation': true
      };

      let addImage = navigator.camera.getPicture(function (image_URI) {
        that.getFileContentAsBase64(image_URI, (base64Image) => {
          that.groupImage = base64Image;
          $('.new-group-image').html(`<img src="${base64Image}">`);
          app.userCollection.fitImage($('.new-group-image img'));
        })

      }, function (err) {
      // Native alerts from phonegap
        navigator.notification.alert(
          err,
          (msg) => true,
          'Error'
        );
      }, options);

      document.addEventListener("deviceready", addImage, false);
    },

    getFileContentAsBase64: function (path,callback) {
        window.resolveLocalFileSystemURL(path, gotFile, fail);

        function fail(e) {
          navigator.notification.alert(
            err,
            (msg) => true,
            'Cannot find requested file'
          );
        };

        function gotFile(fileEntry) {
          fileEntry.file(function(file) {
            let reader = new FileReader();
            reader.onloadend = function(e) {
              let content = this.result;
              callback(content);
            };
            // The most important point, use the readAsDatURL Method from the file plugin
            reader.readAsDataURL(file);
          });
        }
    }
  })

  new app.FriendsView();
})
