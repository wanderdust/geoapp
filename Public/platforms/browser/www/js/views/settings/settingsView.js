// View of the settings.

var app = app || {};
var socket = loadSocket();

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

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      // find the current user.
      // *creates a new user model with the data retrieved from db.
      this.socket.emit('getUser', {
        userId: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        let model = new app.UserModel(res);
        this.render(model);
      })
    },

    render: function (model) {
      let template = Handlebars.compile(this.template);
      let html = template(model.toJSON());

      this.$('#user-dashboard').html(html);
      app.userCollection.fitImage(this.$('.image img'));
      return this;
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    getUserSettings: function () {
      window.location.href = 'settings-profile.html'
    },

    getAccount: function () {
      window.location.href = 'settings-account.html'
    },

    getHelp: function () {
      window.location.href = 'settings-help.html'
    }
  })

  new app.SettingsView();
})
