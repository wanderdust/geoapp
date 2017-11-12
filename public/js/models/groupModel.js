var app = app || {};

$(function () {

  app.GroupModel = Backbone.Model.extend({
    defaults: {
      title: '',
      activeUsers: [],
      groupImage: '',
      pending: false
    }
  })

})
