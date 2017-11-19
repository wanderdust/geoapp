// View of the entire groups window.

var app = app || {};

$(function () {
  app.GroupsView = Backbone.View.extend({
    events: {

    },

    initialize: function () {
      this.socket = io();


      this.render();
    },

    render: function () {
      new app.MapsContent();
      new app.TabsContent();
      
    }
  })
})
