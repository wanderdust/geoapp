// View for a single added-friend.

var app = app || {};
var socket = socket || io();

$(function () {

  app.AddedFriend = Backbone.View.extend({
    tagName: 'li',

    template: $('#added-user-template').html(),

    events: {
      "click .added-friend-image": "removeFriend"
    },

    initialize: function () {
      this.listenTo(this.model, 'add', this.render);
      this.listenTo(this.model, 'addFriendView', this.updateStatus);
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.addClass('hidden');
      return this;
    },

    // Toggles visibility of the friend.
    updateStatus: function (isActive) {
      this.$el.toggleClass('hidden', isActive);
    },

    // Hides the previously added user and removes the
    // 'selected' class from the sideBar user.
    removeFriend: function () {
      this.$el.addClass('hidden');
      this.model.trigger('toggleSelected');
    }
  })

})
