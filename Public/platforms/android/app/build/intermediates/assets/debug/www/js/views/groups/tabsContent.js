// View of the group list.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.TabsContent = Backbone.View.extend({
    el: '#tabs-container',

    events: {
      "click .up-swipe-tabs": "swipeTabs"
    },

    initialize: function () {
      _.bindAll(this, 'render', 'appendAll', 'appendOne');
      this.socket = socket;
      // this.$list = $('.group-list');
      this.$listOnline = $('.group-list.activos');
      this.$listPending = $('.group-list.pendientes');
      this.$listAll = $('.group-list.desconectado');

      this.$tabsHeader = $('#tabs-header');

      // inits the modal to view group's images
      this.modalElem = document.querySelector('.modal');
      this.modalInst = M.Modal.init(this.modalElem, {
        dismissible:true,
        preventScrolling: true
      });

      $('ul.tabs').tabs({
        onShow: (data) => {
          this.updateRouter(data)
        },
       swipeable: true,
       responsiveThreshold: Infinity
      });

      this.listenTo(app.groupCollection, 'add', this.appendOne);
      // this.listenTo(app.groupCollection, 'reset', this.appendAll);

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

      // initModal sends the modal intance to each model.
      group.trigger('initModal', this.modalInst);

    },

    // Clears the view and attaches the new collection.
    appendAll: function (collection) {
      this.$listOnline.html('');
      this.$listPending.html('');
      this.$listAll.html('');
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

    swipeTabs: function (e) {
      let isHasClass = $('.up-swipe-tabs').hasClass('swipeUp');
      let $elements =   $("#tabs-header ,#tabs-container ,#map-container ,#sidebar-icon ,.tabs-content ,.up-swipe-tabs");

      $elements.toggleClass('swipeUp', !isHasClass);

      if (isHasClass) {
        $('.up-swipe-tabs img').attr('src', './css/assets/sidebar-icons/icon_up.svg');
      } else {
        $('.up-swipe-tabs img').attr('src', './css/assets/sidebar-icons/icon_down.svg');
      }

      // if (e.gesture.offsetDirection === 8) {
      //   $elements.addClass('swipeUp');
      // } else if (e.gesture.offsetDirection === 16) {
      //   $elements.removeClass('swipeUp');
      // }
    }

  })

})
