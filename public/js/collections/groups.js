var app = app || {};

$(function () {

  let GroupCollection = Backbone.Collection.extend({
    model: app.GroupModel
  })

  app.groupCollection = new GroupCollection();

})
