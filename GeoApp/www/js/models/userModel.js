// Model for a single user.

var app = app || {};

$(function () {

  app.UserModel = Backbone.Model.extend({
    defaults: {
      name: '',
      isOnline: false,
      isPending: false,
      userImage: 'css/assets/user_placeholder.png',
      _id: ''
    }
  })

})
