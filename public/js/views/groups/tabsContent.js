// View of the group list.

var app = app || {};

$(function () {

  app.TabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {

      "swipe #tabs-header": "swipeTabs"
    },

    initialize: function () {

      this.$list = $('#group-list');
      this.$tabsHeader = $('#tabs-header');

      this.listenTo(app.groupCollection, 'showAll', this.showAll);
      this.listenTo(app.groupCollection, 'showOnline', this.showOnline);
      this.listenTo(app.groupCollection, 'showPending', this.showPending);
      this.listenTo(app.groupCollection, 'add', this.appendOne);

      this.render();
    },

    render: function () {
      // Swipe Events;
      let mc = this.$tabsHeader.hammer()
      mc.data('hammer').get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let view = new app.GroupView({model: group});
      this.$list.append(view.render().el);
    },

    // Clears the view and attaches the new collection.
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

    swipeTabs: function (e) {
      let $elements =   $("#tabs-container ,#map-container ,#sidebar-icon ,.tabs-content");

      if (e.gesture.offsetDirection === 8) {
        $elements.addClass('swipeUp');
      } else if (e.gesture.offsetDirection === 16) {
        $elements.removeClass('swipeUp');
      }
    }

  })

})
