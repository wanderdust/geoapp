// View for one group in Pending.html.

var app = app || {};
var socket = socket || io();

$(function () {

  app.PendingView = Backbone.View.extend({
    tagName: 'li',

    template: $('#group-template').html(),

    events: {
      "click .ok-tick": "addPendingAndUpdate"
    },

    initialize: function () {
      this.socket = socket;
      this.listenTo(this.model, 'change', this.render);
      this.listenToOnce(this.model, 'updateSelected', this.addPending);
    },

    render: function () {
      let isOnline = (this.model.get('activeUsers').length > 0 ? true : false);
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      return this;
    },

    addPending: function () {
      app.groupCollection.trigger('removeClassSelected');
      this.$el.addClass('selected');
    },

    addPendingAndUpdate: function () {
      let that = this;
      let $okTick = $('.ok-tick');
      let groupId = this.model.get('_id');
      let userId = sessionStorage.getItem('userId');

      this.socket.emit('updatePending', {groupId, userId}, (err, res) => {
        if (err)
          return console.log('Could not set model to Pending');

        that.addPending();
        that.render();
      });
    }
  })

})
