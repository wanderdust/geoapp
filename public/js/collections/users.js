// Collection of user models.

var app = app || {};

$(function () {

  let UserCollection = Backbone.Collection.extend({
    model: app.UserModel,

    url: './json/usersDB.json',

    // filters and return collection with online users.
    onlineUsers: function () {
      return this.where({isOnline: true});
    },

      // filters and return collection with offline users.
    offlineUsers: function () {
      return this.where({isOnline: false});
    }
  })

  // New instance of the collection and we grab data with fetch.
  app.userCollection = new UserCollection();
})
