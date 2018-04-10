// Model for a single message.

var app = app || {};

$(function () {

  app.MessageModel = Backbone.Model.extend({
    defaults: {
      from: '',
      timeStamp: '',
      body: '',
      _id: ''
    }
  })
})
