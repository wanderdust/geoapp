// View for a single user.

var app = app || {};

$(function () {

  app.UserView = Backbone.View.extend({
    tagname: 'li',

    template: $('#user-template').html(),

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
