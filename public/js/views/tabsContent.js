var app = app || {};

$(function () {

  app.tabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {
      "click .online-tab": "showOnline",
      "click .pending-tab": "showPending",
      "click .all-tab": "showAll"
    },

    initialize: function () {

      this.$list = $('#group-list');

      app.groupCollection.fetch();
      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'reset', this.appendAll);


    },

    render: function () {

    },

    appendOne: function (group) {
      let view = new app.GroupView({model: group});
      this.$list.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$list.html('');
      collection.each(this.appendOne, this);
    },

    showOnline: function () {
      let filteredCollection = app.groupCollection.online();
      this.appendAll(filteredCollection);
    },

    showPending: function () {
      let filteredCollection = app.groupCollection.pending();
      this.appendAll(filteredCollection);
    },

    showAll: function () {
      this.appendAll(app.groupCollection);
    },

    swipeIt: function (e) {
      if (e.direction == 8) {
        console.log('Swipe up')
      } else if (e.direction == 16) {
        console.log('Swipe down')
      }

    }
  })

})
