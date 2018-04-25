// View for a single message.

var app = app || {};

$(function () {

  app.MessageView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.message,

    events: {

    },

    initialize: function () {
      this.currentUser = sessionStorage.getItem('userId');
    },

    render: function () {
      this.model.getFormattedTime();
      let isMyMessage = this.model.getCurrentUserName(this.currentUser);

      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.addClass('message');
      isMyMessage ? this.$el.addClass('my-message') : "";
      this.$el.html(html);
      return this;
    }
  })

})
