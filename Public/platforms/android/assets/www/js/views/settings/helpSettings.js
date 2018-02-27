// View of the help settings.

var app = app || {};
var socket = socket || io.connect('http://127.0.0.1:3000');

$(function () {

  app.HelpSettings = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .settings-contact": "getContact"
    },

    initialize: function () {

    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings.html';
    },

    getContact: function () {
        window.location.href = 'settings-contact-us.html';
    }
  })

  new app.HelpSettings();
})
