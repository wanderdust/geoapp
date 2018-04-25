// View of the help settings.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.HelpSettings = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .settings-contact": "getContact",
      "click .settings-faq": "getFaq"
    },

    initialize: function () {
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

    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings.html';
    },

    getContact: function () {
        window.location.href = 'settings-contact-us.html';
    },

    getFaq: function () {
      window.location.href = 'settings-faq.html'
    }
  })

  new app.HelpSettings();
})
