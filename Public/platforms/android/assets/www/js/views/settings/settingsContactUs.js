// View of the help settings.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.SettingsContactUs = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {

    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings-help.html';
    }
  })

  new app.SettingsContactUs();
})
