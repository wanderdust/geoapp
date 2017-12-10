// View of the whole pending app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.PendingsView = Backbone.View.extend({
    el: '#app-container',

    template: Handlebars.compile($('#number-of-groups').html()),

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {
      this.socket = socket;
      this.$groupsLength = $('.groups-length');

      this.listenTo(app.groupCollection, 'update', this.render);
      new app.PendingList();

      this.socket.emit('createGroupCollection', {
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if(err)
          return console.log(err);

        app.groupCollection.add(collection);
      })

      this.render();
    },

    render: function () {
      let groupsLength = app.groupCollection.length;

      this.$groupsLength.html(this.template({groupsLength}));
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    }
  })

})
