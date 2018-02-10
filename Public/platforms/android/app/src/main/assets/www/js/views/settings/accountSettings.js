// View of the account settings.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.AccountChangeMail = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .settings-change-email": "getChangeEmail",
      "click .settings-eliminate-account": "getDeleteAccount"
    },

    initialize: function () {

    },

    render: function (model) {

    },

    backToMain: function () {
      window.location.href = 'settings.html';
    },

    getChangeEmail: function () {
      window.location.href = 'settings-change-email.html';
    },

    getDeleteAccount: function () {
      window.location.href = 'settings-delete-account.html';
    }
  })

  new app.AccountChangeMail();
})
