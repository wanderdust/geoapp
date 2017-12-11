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
      let that = this;
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;
      this.$groupsLength = $('.groups-length');

      this.listenTo(app.groupCollection, 'update', this.render);
      new app.PendingList();

      this.socket.emit('createGroupCollection', {userId}, (err, collection) => {
        if(err)
          return console.log(err);

        app.groupCollection.add(collection);

        that.socket.emit('findIfPending', {userId}, (err, status) => {
          if (err)
            return console.log(err);

          let model = app.groupCollection.findWhere({_id: status.groupId});
          model.trigger('updateSelected')
        })
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
