// View of the whole searched users app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.SearchedUsersView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click .back-arrow-container": "backToMain",
      "click .search-icon": "searchFriends",
    },

    initialize: function () {
      this.socket = socket;
      this.$list = $('.groups-list ul');

      new app.SearchedUsersList();
      this.listenTo(app.userCollection, 'showAlert', this.snackBar);
    },

    render: function () {

    },

    // Sends the query to the server and returns documents that match the query.
    searchFriends: function () {
      let query = $('.search-friends').val();
      let userId = sessionStorage.getItem('userId')

      if (query.trim() === "")
        return this.snackBar('Introduce un nombre para empezar a buscar')

      this.$list.html("");
      this.socket.emit('searchFriends', {
        query, userId
      }, (err, collection) => {
        if(err)
          return console.log(err);

        app.userCollection.add(collection);
      })
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    // Message bar.
    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

})
