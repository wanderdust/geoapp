// View of a single group model.

var app = app || {};

$(function () {

  app.RequestView = Backbone.View.extend({
    tagName: 'li',

    template: $('#request-template').html(),

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
