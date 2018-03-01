// Model for a single user.

var app = app || {};

$(function () {

  app.UserModel = Backbone.Model.extend({
    defaults: {
      name: '',
      isOnline: false,
      isPending: false,
      timeStamp: 0,
      userImage: 'css/assets/user_placeholder.svg',
      userStatus: '¡Estoy usando GeoApp!',
      _id: ''
    }
  })

})
