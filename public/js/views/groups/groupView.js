var app = app || {};

$(function () {

  app.GroupView = Backbone.View.extend({
    tagname: 'li',

    template: $('#group-template').html(),

    events: {

    },

    initialize: function () {
      
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    }
  })

})
