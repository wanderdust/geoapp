// View of the settings.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.SettingsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.userTemplateB,

    events: {
      "click #back-arrow-container": "backToMain",
      "click #user-dashboard" : "getUserSettings",
      "click .settings-account": "getAccount",
      "click .settings-help": "getHelp"
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
      })
    },

    render: function (model) {
      let template = Handlebars.compile(this.template);
      let html = template(model.toJSON());

      this.$('#user-dashboard').html(html);
      return this;
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    getUserSettings: function () {
      window.location.href = 'settings-profile.html'
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
