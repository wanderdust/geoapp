// Model for a single request.

var app = app || {};

$(function () {

  app.RequestModel = Backbone.Model.extend({
    defaults: {
      title: "",
      groupImage: "css/assets/group_placeholder.png",
      sentBy: "",
      timeStamp: 0,
      userStatus: "¡Estoy usando GeoApp!",
      _id: ''
    }
  })

})
