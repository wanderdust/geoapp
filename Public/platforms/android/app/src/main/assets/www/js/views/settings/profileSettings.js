// View of the settings.

var app = app || {};
var socket = socket || io.connect('http://127.0.0.1:3000');

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

      // find the current user.
      // *creates a new user model with the data retrieved from db.
      this.socket.emit('getUser', {
        userId: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err)
          return console.log(err);

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
      let userImage = ""; //this.userImage
      let userName = this.userName;
      let userStatus = this.userStatus;

      if (!this.verifyData(userStatus, userName))
        return this.snackBar('Nombre y estado tienen que contener al menos 1 caracter');

      this.socket.emit('saveProfileSettings', {
        userImage,
        userName,
        userStatus
      }, (err, res) => {
        if (err)
          return alert('Error:' + err);

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

      navigator.camera.getPicture(function (imageData) {
        that.updateData(imageData);
        $('.user-image .photo').attr('src', imageData);
      }, (err) => {
        alert('Error:' + err)
      }, options)
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
