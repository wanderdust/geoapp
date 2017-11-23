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
      this.listenToOnce(this.model, 'updateOne', this.updateOne)
    },

    render: function () {
      let isOnline = (this.model.get('isOnline'));
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      return this;
    },
    // The view gets removed and re-appended to be on the correct column.
    updateOne: function (model) {
      this.$el.remove();
      app.userCollection.trigger('add', model);
    }
  })

})
