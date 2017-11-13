var app = app || {};

$(function () {

  app.TabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {
      "click .online-tab": "showOnline",
      "click .pending-tab": "showPending",
      "click .all-tab": "showAll",
      "swipe #tabs-header": "swipeTabs"
    },

    initialize: function () {

      this.$list = $('#group-list');
      this.$tabsHeader = $('#tabs-header');


      app.groupCollection.fetch();
      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'reset', this.appendAll);
      this.render();

    },

    render: function () {
      // Swipe Events;
      let mc = this.$tabsHeader.hammer()
      mc.data('hammer').get('swipe').set({ direction: Hammer.DIRECTION_ALL });
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
