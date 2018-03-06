// View of the change email view.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.SettingsChangeMail = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .continue-btn": "changeEmail"
    },

    initialize: function () {
      this.socket = socket;

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));
    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-account.html';
    },

    changeEmail: function () {
      let $email = $('.change-mail-input.email').val();
      let $password = $('.change-mail-input.password').val();

      if ($email.trim() === "" || $password.trim() === "") {
        return this.snackBar('Tienes que rellenar todos los campos');
      }

      this.socket.emit('changeEmail', {
        newEmail : $email,
        password: $password,
        _id: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err) {
          if (err.Error === 0) {
            this.snackBar(err.Message)
          } else if (err.Error === 1) {
            this.snackBar(err.Message)
          } else {
            this.snackBar(err.Message)
          }
          return
        };

        localStorage.setItem('userE1d9rg76397d11', res)
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
