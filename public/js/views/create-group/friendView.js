// View for a single user-friend.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.userTemplateA,

    events: {
      "click .ok-tick": "updateStatus"
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'toggleSelected', this.updateStatus)
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    updateStatus: function () {
      let $friend = this.$el;
      let isSelected = $friend.hasClass('selected');

      $friend.toggleClass('selected', !isSelected);
      this.model.trigger('addFriendView', isSelected);

      if(!isSelected) {
        app.userCollection.trigger('addFriend', this.model);
      } else {
        app.userCollection.trigger('removeFriend', this.model)
      }
    }
  })

})
