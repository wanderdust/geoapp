// Collection of message models.

var app = app || {};

$(function () {

  let MessageCollection = Backbone.Collection.extend({
    model: app.MessageModel
  })

  app.messageCollection = new MessageCollection();
})
