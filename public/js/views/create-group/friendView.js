// View for a single user-friend.

var app = app || {};

$(function () {

  app.FriendView = Backbone.View.extend({
    tagName: 'li',

    template: $('#user-template').html(),

    events: {
      "click .ok-tick": "changeStatus"
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    changeStatus: function () {
      let $friend = this.$('.user-container');
      let isSelected = $friend.hasClass('selected')
      $friend.toggleClass('selected', !isSelected);
    }
  })

})
