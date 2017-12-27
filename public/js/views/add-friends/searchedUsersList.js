// View of all the friends views.

var app = app || {};

$(function () {

  app.SearchedUsersList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
        this.listenTo(app.userCollection, 'add', this.appendOne);
        this.$list = $('.groups-list ul');
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {
      let view = new app.SearchedUserView({model: user});
      this.$list.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$list.html('');
      collection.each(this.appendOne, this);
    }
  })

})
