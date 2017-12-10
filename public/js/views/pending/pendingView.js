// View for one group in Pending.html.

var app = app || {};

$(function () {

  app.PendingView = Backbone.View.extend({
    tagName: 'li',

    template: $('#group-template').html(),

    events: {

    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    }
  })

})
