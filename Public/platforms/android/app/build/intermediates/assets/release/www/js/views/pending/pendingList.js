// View of all the pending views.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.PendingList = Backbone.View.extend({
    el: '.tabs-content',

    template: Templates.contentPlaceholder,

    events: {

    },

    initialize: function () {
      this.socket = socket;
      this.$requestList = $('.groups-list ul');

      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'reset', this.appendAll);
      this.listenTo(app.groupCollection, 'add addPlaceHolder', this.render);

      socket.on('newGroupUpdates', (data) => {
        app.groupCollection.findAndUpdateOneOnline(data);
      });

      socket.on('userNameUpdate', (data) => {
        app.groupCollection.findAndUpdateGroups(data);
      });

      socket.on('newPendingUpdates', (data) => {
        app.groupCollection.findAndUpdateOnePending(data)
      });
    },

    render: function () {
      let content = $('.groups-list ul').html().trim();
      // Placeholder.
      if (content === "") {
        let template = Handlebars.compile(this.template);
        let html = template({placeholder: 'No estás en ningún grupo'});

        this.$el.append(html);
        return this;
      } else {
        $('.empty-list-placeholder').remove();
      }
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let view = new app.PendingView({model: group});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    }
  })

})
