// View of the group list.

var app = app || {};
var socket = socket || io();

$(function () {

  app.TabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {
      "swipe #tabs-header": "swipeTabs"
    },

    initialize: function () {
      _.bindAll(this, 'render');
      this.socket = socket;
      this.$list = $('#group-list');
      this.$tabsHeader = $('#tabs-header');

      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'filter', this.filterAll);
      this.listenTo(app.groupCollection, 'change', this.filterOne);

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

    filterOne: function (group) {
      group.trigger('visible');
    },

    filterAll: function () {
      app.groupCollection.each(this.filterOne, this);
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
