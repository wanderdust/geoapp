// View of the group list.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.TabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {
      "swipe #tabs-header": "swipeTabs"
    },

    initialize: function () {
      _.bindAll(this, 'render');
      this.socket = socket;
      // this.$list = $('.group-list');
      this.$listOnline = $('.group-list.activos');
      this.$listPending = $('.group-list.pendientes');
      this.$listAll = $('.group-list.desconectado');

      this.$tabsHeader = $('#tabs-header');

       $('ul.tabs').tabs({
         onShow: (data) => {
           this.updateRouter(data)
         },
         swipeable: true,
         responsiveThreshold: Infinity
       });

      this.listenTo(app.groupCollection, 'add', this.appendOne);
      this.listenTo(app.groupCollection, 'change', this.filterOne);

      this.render();
    },

    render: function () {
      // Swipe Events;
      let mc = this.$tabsHeader.hammer();
      mc.data('hammer').get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let isOnline = (group.get('activeUsers').length > 0 ? true : false);
      let isPending = (group.get('activeUsers').length === 0 && group.get('pendingUsers').length > 0 ? true : false);
      let view = new app.GroupView({model: group});

      if (isOnline) {
        this.$listOnline.append(view.render().el);
      } else if (isPending) {
        this.$listPending.append(view.render().el);
      } else {
        this.$listAll.append(view.render().el);
      }

    },

    // Clears the view and attaches the new collection.
    appendAll: function (collection) {
      this.$list.html('');
      collection.each(this.appendOne, this);
    },

    updateRouter: function (data) {
      let el = $(data)
      if (el.is('#swipe-1')) {
        window.location.href = 'main.html#/online'
      } else if (el.is('#swipe-2')) {
        window.location.href = 'main.html#/pending'
      } else {
        window.location.href = 'main.html#/all'
      }
    },

    filterOne: function (group) {
      console.log('"changed" event fired');
      group.trigger('updateOne', group);
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
