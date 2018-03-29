// Model for a single user.

// ** timeStamp keeps track of the last pending timeStamp
// ** time is the amount of time in WORDS since the timestamp was generated.

var app = app || {};

$(function () {

  app.UserModel = Backbone.Model.extend({
    defaults: {
      name: '',
      isOnline: false,
      isPending: false,
      timeStamp: 0,
      time: 0,
      userImage: 'css/assets/user_placeholder.svg',
      userStatus: '¡Estoy usando GeoApp!',
      _id: ''
    }
  })

})
