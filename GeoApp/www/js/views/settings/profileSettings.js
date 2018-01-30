// View of the settings.

var app = app || {};
var socket = socket || io.connect('https://geo-app-amigos.herokuapp.com');

$(function () {

  app.SettingsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.userTemplateB,

    events: {
      "click #back-arrow-container": "backToMain",
      "click .edit-icon": "edit",
      "blur .name-input": "closeEdit"
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
        console.log(model)
        // this.render(model);
      })
    },

    render: function (model) {
      let template = Handlebars.compile(this.template);
      let html = template(model.toJSON());

      this.$('#user-dashboard').html(html);
      return this;
    },

    edit: function () {
      $('.name-input').attr('contenteditable', 'true').focus();
    },

    closeEdit: function () {
      $('.name-input').attr('contenteditable', 'false');
      console.log($('.name-input').html())
    },

    backToMain: function () {
      window.location.href = 'settings.html';
    }
  })

  new app.SettingsView();
})
