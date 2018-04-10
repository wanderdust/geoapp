// View for a single message.

var app = app || {};

$(function () {

  app.MessageView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.message,

    events: {

    },

    initialize: function () {

    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.addClass('message');
      this.$el.html(html);
      return this;
    }
  })

})
