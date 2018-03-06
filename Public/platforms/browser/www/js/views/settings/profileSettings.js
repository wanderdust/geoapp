// View of the settings.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.ProfileSettingsView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .edit-icon": "editName",
      "blur .name-input": "closeEdit",
      "click .edit-icon-status": "editStatus",
      "blur .status-input": "closeEditStatus",
      "click #profile-image-container": "addUserImage"
    },

    initialize: function () {
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

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

    // Renders and sets the initial values for the user variables.
    render: function (model) {
      let userName = model.get('name');
      let userImage = model.get('userImage');
      let userStatus = model.get('userStatus');

      $('.user-image .photo').attr('src', userImage);
      $('.name-input').html(userName);
      $('.status-input').html(userStatus);
      app.userCollection.fitImage(this.$('.user-image .photo'));
    },

    // Sets the name in edit mode.
    editName: function () {
      $('.name-input').attr('contenteditable', 'true').focus();
    },

    // Ends the name edit mode.
    closeEdit: function () {
      $('.name-input')
      .attr('contenteditable', 'false')
      .html($('.name-input').text().trim());
      this.updateData();
    },

    // Sets the status in edit mode.
    editStatus: function () {
      $('.status-input').attr('contenteditable', 'true').focus();
    },

    // Ends the status edit mode.
    closeEditStatus: function () {
      $('.status-input')
      .attr('contenteditable', 'false')
      .html($('.status-input').text().trim());
      this.updateData();
    },

    // updates the variables with the user info.
    updateData: function (imageData) {
      this.userStatus = $('.status-input').html();
      this.userName = $('.name-input').html();
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

      this.socket.emit('saveProfileSettings', {
        userId,
        userName,
        userImage,
        userStatus
      }, (err, res) => {
        if (err) {
          // Native alerts from phonegap
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );
        }

        window.location.href = 'settings.html';
      })
    },

    addUserImage: function () {
      let that = this;
      let options = {
        'destinationType': 1,
        'sourceType': 0,
        'mediaType': 0,
        'correctOrientation': true
      };

      navigator.camera.getPicture(function (image_URI) {
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
