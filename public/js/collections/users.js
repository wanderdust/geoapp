var app = app || {};

$(function () {

  let UserCollection = Backbone.Collection.extend({
    model: app.UserModel,

    url: './json/usersDB.json',

    onlineUsers: function () {
      return this.where({isOnline: true});
    },

    offlineUsers: function () {
      return this.where({isOnline: false})
    }
  })

  app.userCollection = new UserCollection();
  app.userCollection.fetch();
})
