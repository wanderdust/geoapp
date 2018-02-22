// Collection of group models.

var app = app || {};

$(function () {

  let RequestCollection = Backbone.Collection.extend({
    model: app.RequestModel
  })

  app.requestCollection = new RequestCollection();
})
