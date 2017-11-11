var app = app || {};

$(function () {

  let GroupCollection = Backbone.Collection.extend({
    model: app.GroupModel,

    url: 'groupsDB.json'
  })

  app.groupCollection = new GroupCollection();
})
