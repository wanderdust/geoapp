// View of the settings.

var app = app || {};
var socket = socket || io.connect('https://geo-app-amigos.herokuapp.com');

$(function () {

  app.SettingsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.userTemplateB,

    events: {
      "click #back-arrow-container": "backToMain",
      "click .settings-account": "getAccount",
      "click .settings-help": "getHelp"
    },

    initialize: function () {
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;

      // find the current user.
      this.socket.emit('getUser', {
        userId: sessionStorage.getItem('userId')
      }, (err, model) => {
        if (err)
          return console.log(err);

        this.render(model);
      })
    },

    render: function (model) {
      let template = Handlebars.compile(this.template);
      let html = template(model);

      this.$('#user-dashboard').html(html);
      return this;
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    getAccount: function () {
      console.log('Account settings');
    },

    getHelp: function () {
      console.log('Help settings');
    }
  })

  new app.SettingsView();
})
