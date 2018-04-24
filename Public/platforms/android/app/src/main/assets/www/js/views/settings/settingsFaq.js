// View of the faq settings.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.SettingsFaq = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain"
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

      let elem = document.querySelector('.collapsible');
      let instance = M.Collapsible.init(elem, {});
    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-help.html';
    }
  })

  new app.SettingsFaq();
})
