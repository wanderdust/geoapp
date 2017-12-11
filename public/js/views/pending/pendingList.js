// View of all the pending views.

var app = app || {};

$(function () {

  app.PendingList = Backbone.View.extend({
    el: '.tabs-content',

    events: {

    },

    initialize: function () {
      this.$requestList = $('.groups-list ul')

      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'removeClassSelected', this.removeAndUpdate)
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let view = new app.PendingView({model: group});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    },

    removeAndUpdate: function () {
      this.$(".selected").removeClass('selected');
    }
  })

})
