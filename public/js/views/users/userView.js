// View for a single user.

var app = app || {};

$(function () {

  app.UserView = Backbone.View.extend({
    tagName: 'li',

    template: $('#user-template').html(),

    events: {

    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      let isOnline = (this.model.get('isOnline'));
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      return this;
    }
  })

})
