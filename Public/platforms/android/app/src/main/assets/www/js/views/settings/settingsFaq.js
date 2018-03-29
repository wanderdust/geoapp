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
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

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
