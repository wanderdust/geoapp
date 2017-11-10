var app = app || {};

$(function () {

  let UserCollection = Backbone.Collection.extend({
    model: app.UserModel
  })

  app.userCollection = new UserCollection();

})
