
var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.DeleteAccount = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .continue-btn": "deleteAccount"
    },

    initialize: function () {
      this.socket = socket;
    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-account.html';
    },

    deleteAccount: function () {
      let $password = $('.change-mail-input.password').val();

      let remove = confirm("¿Estás seguro de que quieres continuar?");

      if(!remove)
        return

      this.socket.emit('deleteAccount', {
        _id: sessionStorage.getItem('userId'),
        password: $password
      }, (err, res) => {
        if (err) {
          if (err.Error === 0) {
            this.snackBar('Contraseña incorrecta');
          } else if (err.Error === 99) {
            this.snackBar('Ha ocurrido un error');
          }
          return
        }

        sessionStorage.clear();
        window.location.href = 'sign-in.html';
      })
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

  new app.DeleteAccount();
})
