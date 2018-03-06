
var app = app || {};
var socket = loadSocket();

$(function () {

  app.DeleteAccount = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .continue-btn": "confirmDelete"
    },

    initialize: function () {
      this.socket = socket;
      _.bindAll(this, 'deleteAccount', 'confirmDelete');

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-account.html';
    },

    confirmDelete () {
      navigator.notification.confirm(
        '¿Estás seguro de que quieres continuar?',
        this.deleteAccount,
        'Eliminar cuenta',
        ['Si', 'No']
      );
    },

    deleteAccount: function (btn) {
      let $password = $('.change-mail-input.password').val();
      let remove;

      if (btn === 1) {
        remove = true;
      } else {
        remove = false;
      }

      if(!remove)
        return

      this.socket.emit('deleteAccount', {
        _id: sessionStorage.getItem('userId'),
        password: $password
      }, (err, res) => {
        if (err) {
          if (err.Error === 0) {
            this.snackBar(err.Message);
          } else if (err.Error === 99) {
            this.snackBar(err.Message);
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
