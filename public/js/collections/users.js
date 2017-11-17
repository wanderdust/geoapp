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
    },

    // Returns boolean of the online status of the current group.
    //Do it by _id.
    isOnline: function (name) {
      let model = this.where({isOnline: true});

      let isOnline = model.length > 0;

      // Undefined for the moment
      let pending;

      return {isOnline, pending}
    }
  })

  // New instance of the collection and we grab data with fetch.
  app.userCollection = new UserCollection();
})
