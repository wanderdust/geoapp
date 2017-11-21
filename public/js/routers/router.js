var app = app || {};

$(function () {

  let GroupsRouter = Backbone.Router.extend({
    routes: {
      "*filter": "setFilter",
      // "all": "showAll",
      // "pending": "showPending",
      // "online": "showOnline"
    },

    setFilter(param) {
      app.GroupFilter = param || "";

      app.groupCollection.trigger('filter');
    }
  })
  app.groupsRouter = new GroupsRouter();
  Backbone.history.start();
})
