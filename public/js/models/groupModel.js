var app = app || {};

$(function () {

  app.GroupModel = Backbone.Model.extend({
    defaults: {
      title: '',
      status: 'offline',
      activeUsers: [],
      groupImage: ''
    }
  })

})
