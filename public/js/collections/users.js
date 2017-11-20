// Collection of user models.

var app = app || {};

$(function () {

  let UserCollection = Backbone.Collection.extend({
    model: app.UserModel,

    url: './json/usersDB.json',

    // filters and returns collection with online users.
    onlineUsers: function () {
      return this.where({isOnline: true});
    },

      // filters and returns collection with offline users.
    offlineUsers: function () {
      return this.where({isOnline: false});
    },

    // looks for online/pending users. If it finds one returns true.
    isStatus: function (filterType) {
      let model;

      if (filterType === 'online') {
        model = this.where({isOnline: true})
      } else {
        model = this.where({isPending: true})
      }
      return model.length > 0;
    }
  })

  // New instance of the collection and we grab data with fetch.
  app.userCollection = new UserCollection();
})
