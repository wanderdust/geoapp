var app = app || {};

$(function () {

  let GroupsRouter = Backbone.Router.extend({
    routes: {
      "all": "showAll",
      "pending": "showPending",
      "online": "showOnline"
    },

    showAll: function () {
      app.groupCollection.trigger('showAll');
    },

    showPending: function () {
      app.groupCollection.trigger('showPending');
    },

    showOnline: function () {
      app.groupCollection.trigger('showOnline');
    }
  })
  app.groupsRouter = new GroupsRouter();
  Backbone.history.start();
})
