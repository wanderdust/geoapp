
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
      document.addEventListener("deviceready", this.onDeviceReady, false);

    },

    render: function (model) {

    },

    onDeviceReady: function () {
      return device.uuid;
    },

    backToMain: function () {
      window.location.href = 'settings-account.html';
    },

    confirmDelete: function () {
      navigator.notification.confirm(
        '¿Estás seguro de que quieres continuar?',
        this.deleteAccount,
        'Eliminar cuenta',
        ['Si', 'No']
      );
    },

    deleteAccount: function (btn) {
      let $prefix = $('#prefix').val();
      let $phone = $('#phone').val();
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
        uuid: this.onDeviceReady(),
        prefix: $prefix,
        phone: $phone
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
