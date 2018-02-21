// View of the change password view.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.SettingsChangeMail = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .continue-btn": "changePassword"
    },

    initialize: function () {
      this.socket = socket;
    },

    render: function () {

    },

    backToMain: function () {
      window.location.href = 'settings-account.html';
    },

    changePassword: function () {
      let $password = $('.password-old').val().trim();
      let $newPassword = $('.password').val().trim();
      let $repeatPassword = $('.password-repeat').val().trim();

      if ($password === "" || $newPassword === "" || $repeatPassword === "") {
        return this.snackBar('Tienes que rellenar todos los campos');
      } else if ($newPassword.length < 6) {
        return this.snackBar('La contraseña tiene que tener al menos 6 caracteres');
      } else if ($newPassword.trim() !== $repeatPassword.trim()) {
        return this.snackBar('Las contraseñas no coinciden');
      }

      this.socket.emit('changePassword', {
        _id: sessionStorage.getItem('userId'),
        password: $password,
        newPassword: $newPassword
      }, (err, res) => {
        if (err) {
          if (err.Error === 0) {
            this.snackBar(err.Message);
          } else if (err.Error === 99) {
            this.snackBar(err.Message);
          }
          return
        };
        window.location.href = 'main.html';
      })
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

  new app.SettingsChangeMail();
})
