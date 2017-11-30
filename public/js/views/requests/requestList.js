// View of all the request views.

var app = app || {};

$(function () {

  app.RequestList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      this.$requestList = $('.invitations-list ul')

      this.listenTo(app.requestCollection, 'add', this.appendOne);
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (request) {
      let view = new app.RequestView({model: request});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    }
  })

})
