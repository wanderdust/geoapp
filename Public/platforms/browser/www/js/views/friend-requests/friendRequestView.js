// View of a single friend-request model.

var app = app || {};

$(function () {

  app.FriendRequestView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.requestTemplate,

    events: {
      "click .accept-btn": "addFriend",
      "click .reject-btn": "rejectFriend"
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'remove', this.remove)
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    addFriend: function () {
      app.requestCollection.trigger('addFriend', this.model);
    },

    rejectFriend: function () {
      app.requestCollection.trigger('rejectFriend', this.model);
    }
  })

})
