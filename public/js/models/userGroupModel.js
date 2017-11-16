// Model for a single user_group.
// Change names for ID's.

var app = app || {};

$(function () {

  app.UserGroupModel = Backbone.Model.extend({
    defaults: {
      groupName: '',
      userName: '',
      online: false,
      pending: false
    }
  })
})
