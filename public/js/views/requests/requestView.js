// View of a single group model.

var app = app || {};

$(function () {

  app.RequestView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.requestTemplateGroup,

    events: {
      "click .accept-btn": "addUserToGroup",
      "click .reject-btn": "rejectGroup"
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'remove', this.remove)
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    addUserToGroup: function () {
      app.requestCollection.trigger('addGroup', this.model);
    },

    rejectGroup: function () {
      app.requestCollection.trigger('rejectGroup', this.model)
    }
  })

})
