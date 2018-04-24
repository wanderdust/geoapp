// View of the settings.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.ProfileSettingsView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .edit-icon": "editName",
      "blur .name-input input": "closeEdit",
      "click .edit-icon-status": "editStatus",
      "blur .status-input": "closeEditStatus",
      "click #profile-image-container": "addUserImage"
    },

    initialize: function () {
      _.bindAll(this, 'saveDataLocally')
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', {
        id: sessionStorage.getItem('userId'),
        token: sessionStorage.getItem('token')
      }, (err, res) => {
        if (err) {
          if (err.Error === 401)
            return window.location.href = 'index.html'
          return
        }
        return
      });

      this.loadCache();

      // find the current user.
      // *creates a new user model with the data retrieved from db.
      this.socket.emit('getUser', {
        userId: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        let model = new app.UserModel(res);
        this.render(model);
        this.updateData(model.get('userImage'));
      })
    },

    // Renders local data if there is any
    loadCache: function () {
      if (localStorage.getItem('profileInfo_geoApp') === null)
        return;

      let cache = JSON.parse(localStorage.getItem('profileInfo_geoApp'));
      let model = new app.UserModel(cache);
      this.render(model);
      this.updateData(model.get('userImage'));
    },

    saveDataLocally: function (userName, userStatus, _id) {
      let userImage;

      let userInfo = {
        name: userName,
        userStatus: userStatus,
        _id: _id
      };
      if (localStorage.getItem('profileImageURI_geoApp') !== null) {
        userInfo.userImage = localStorage.getItem('profileImageURI_geoApp');
      }

      userInfo = JSON.stringify(userInfo);
      localStorage.setItem('profileInfo_geoApp', userInfo);

    },

    // Renders and sets the initial values for the user variables.
    render: function (model) {
      let userName = model.get('name');
      let userImage = model.get('userImage');
      let userStatus = model.get('userStatus');

      $('.user-image .photo').attr('src', userImage);
      $('.name-input p').html(userName);
      $('.status-input p').html(userStatus);
      app.userCollection.fitImage(this.$('.user-image .photo'));
    },

    // Sets the name in edit mode.
    editName: function () {
      $('.name-input p').addClass('hidden');
      $('.name-input input')
        .removeClass('hidden')
        .val($('.name-input p').html())
        .focus();
    },

    // Ends the name edit mode.
    closeEdit: function () {
      $('.name-input input').addClass('hidden');
      $('.name-input p').removeClass('hidden').html($('.name-input input').val());
      this.updateData();
    },

    // Sets the status in edit mode.
    editStatus: function () {
      $('.status-input p').addClass('hidden');
      $('.status-input input')
        .removeClass('hidden')
        .val($('.status-input p').html())
        .focus();
    },

    // Ends the status edit mode.
    closeEditStatus: function () {
      $('.status-input input').addClass('hidden')
      $('.status-input p').removeClass('hidden').html($('.status-input input').val())
      this.updateData();
    },

    // updates the variables with the user info.
    updateData: function (imageData) {
      this.userStatus = $('.status-input p').html();
      this.userName = $('.name-input p').html();
      if (imageData)
          this.userImage = imageData;
    },

    // Verifies that no cell is empty.
    verifyData: function (userName, userStatus) {
      if (userName === "" || userStatus === "")
        return false;

      return true;
    },

    // Saves data before going to settings view.
    backToMain: function () {
      let userName = this.userName;
      let userStatus = this.userStatus;
      let userId = sessionStorage.getItem('userId');
      let userImage = this.userImage;

      if (!this.verifyData(userStatus, userName))
        return this.snackBar('Nombre y estado tienen que contener al menos 1 caracter');

      this.saveDataLocally(userName, userStatus, userId);
      this.socket.emit('saveProfileSettings', {
        userId,
        userName,
        userImage,
        userStatus
      });

      window.location.href = 'settings.html';
    },

    addUserImage: function () {
      let that = this;
      let options = {
        'destinationType': 1,
        'sourceType': 0,
        'mediaType': 0,
        'correctOrientation': true,
        'quality': 25,
        'allowEdit': true
      };

      navigator.camera.getPicture(function (image_URI) {
        localStorage.setItem('profileImageURI_geoApp', image_URI)
        that.updateData(image_URI);
        that.getFileContentAsBase64(image_URI, (base64Image) => {
          that.userImage = base64Image;
          $('.user-image .photo').attr('src', base64Image);
        })
      }, (err) => {
        alert('Error:' + err)
      }, options)
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
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

  new app.ProfileSettingsView();
})
