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

    // Returns boolean of the online/pending status of the current group.
    //Do it by _id.
    isStatus: function (name, filterType) {
      let model;

      if (filterType === 'isOnline') {
        model = this.where({isOnline: true})
      } else {
        model = this.where({pending: true})
      }
      return model.length > 0;
    }
  })

  // New instance of the collection and we grab data with fetch.
  app.userCollection = new UserCollection();
})
