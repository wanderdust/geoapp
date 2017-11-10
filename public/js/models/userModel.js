var app = app || {};

$(function () {

  app.UserModel = Backbone.Model.extend({
    defaults: {
      name: '',
      status: 'offline',
      userImage: ''
    }
  })

})
