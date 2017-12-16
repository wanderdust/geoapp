// View of the whole pending app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendsView = Backbone.View.extend({
    el: 'body',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .back-arrow-container": "closeNavBar",
      "click .continue-btn": "closeNavAndSave",
      "click .add-friends-btn": "openNavBar"
    },

    initialize: function () {
      this.socket = socket;

      this.listenTo(app.groupCollection, 'showAlert', this.snackBar);
      new app.FriendsMap();
      new app.FriendList();

    },

    render: function () {

    },

    openNavBar: function () {
      this.$('.friends-query').focus();
      this.$('.friends-query').val("");
      this.$('#sidebar-container').addClass('active');
      this.$('#app-container.group-add').addClass('active');
    },

    closeNavBar: function () {
      this.$(".selected").removeClass('selected');
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
    },

    closeNavAndSave: function () {
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

})
