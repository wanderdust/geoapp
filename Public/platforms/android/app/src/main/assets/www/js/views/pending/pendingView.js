// View for one group in Pending.html.

var app = app || {};
var socket = socket || io.connect('http://192.168.0.30:3000');

$(function () {

  app.PendingView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.groupTemplatePending,

    events: {
      "click .ok-tick": "addPendingAndUpdate"
    },

    initialize: function () {
      this.socket = socket;
      this.listenTo(this.model, 'change', this.render);
      this.listenToOnce(this.model, 'updateSelected', this.addPending);
      this.listenTo(this.model, 'render', this.render);
    },

    render: function () {
      let isPending = (this.model.get('activeUsers').length === 0 && this.model.get('pendingUsers').length > 0 ? true : false);
      let isOnline = (this.model.get('activeUsers').length > 0 ? true : false);
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      this.$el.toggleClass('pending', isPending);
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
        if (err) {
          app.groupCollection.trigger('showAlert', err);
          return;
        }
        that.addPending();
        app.groupCollection.trigger('showAlert', res);
      });
    }
  })

})
