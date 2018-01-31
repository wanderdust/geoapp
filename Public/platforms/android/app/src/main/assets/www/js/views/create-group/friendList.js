// View of all the friend views.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.FriendList = Backbone.View.extend({
    el: '.tabs-content',

    events: {
      "click .continue-btn": "saveFriendsArray",
    },

    initialize: function () {
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;
      this.$requestList = $('.groups-list ul');
      this.friendsArray = [];

      this.listenTo(app.userCollection, 'add', this.appendOne);
      this.listenTo(app.userCollection, 'search', this.search);
      this.listenTo(app.userCollection, 'addFriend', this.addFriendToArray);
      this.listenTo(app.userCollection, 'removeFriend', this.removeFriendFromArray);
      this.listenTo(app.userCollection, 'clearArray', this.removeAllFriends);

      this.socket.emit('createFriendsCollection', userId, (err, collection) => {
        if (err)
          return console.log(err)

        app.userCollection.add(collection);
      });
    },

    render: function () {

    },

    // Appends one model every time there is an 'add' event.
    appendOne: function (friend) {
      let view = new app.FriendView({model: friend});
      this.$requestList.append(view.render().el);
    },

    // Clears the view and appends all.
    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    },

    // Shows/hides users when introducing a query.
    search: function() {
      let input, filter, ul, li, a, i;
      input = $('.friends-query');
      filter = input.val().toUpperCase();
      ul = $('.groups-list ul');
      li = ul.find('li');

      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < li.length; i++) {
          name = li[i].getElementsByClassName("group-title")[0].innerHTML.toUpperCase();
          if (name.indexOf(filter) > -1) {
              li[i].style.display = "";
          } else {
              li[i].style.display = "none";
          }
      }
  	},

    // Adds a friend to the friends array.
    addFriendToArray: function (model) {
      this.friendsArray.push(model.get('_id'));
    },

    // Removes a friend from the friends array.
    removeFriendFromArray: function (model) {
      let index = this.friendsArray.indexOf(model.get('_id'));
      this.friendsArray.splice(index, 1);
    },

    // Sends the friends array data to the main view.
    saveFriendsArray: function () {
      app.userCollection.trigger('groupFriends', this.friendsArray)
    },

    // Clears the friendsArray. Fired when user clicks return button.
    removeAllFriends: function () {
      this.friendsArray = [];
    }
  })
});
