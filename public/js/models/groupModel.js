var app = app || {};

$(function () {

  app.GroupModel = Backbone.Model.extend({
    defaults: {
      title: '',
      coords: {
        lat: undefined,
        lng: undefined
      },
      activeUsers: [],
      groupImage: '',
      pending: false,
      _id: ''
    }
  })

})
