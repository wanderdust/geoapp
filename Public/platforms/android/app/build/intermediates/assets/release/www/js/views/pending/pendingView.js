// View for one group in Pending.html.

var app = app || {};
var socket = loadSocket();

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
      app.groupCollection.fitImage(this.$('.image img'));
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
      let isSelected = this.$el.hasClass('selected');

      if (!isSelected) {
        this.socket.emit('updatePending', {groupId, userId}, (err, res) => {
          if (err) {
            app.groupCollection.trigger('showAlert', err);
            return;
          }
          that.addPending();
          app.groupCollection.trigger('showAlert', res);
        });
      } else {
        this.socket.emit('cancelPending', {groupId, userId}, (err, callback) => {
          if (err) {
            app.groupCollection.trigger('showAlert', err);
            return
          }

        this.$el.removeClass('selected');
        })
      }
    }
  })

})
