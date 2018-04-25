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
      this.$listToday = $('.group-list.today');
      this.$listTomorrow = $('.group-list.tomorrow');
      this.$listUpcoming = $('.group-list.upcoming');

      this.$groupList = $('.group-list');

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
      this.listenTo(app.groupCollection, 'reset', this.appendAll);

      this.render();
    },

    render: function () {
      // Swipe Events;
      let mc = this.$groupList.hammer();
      mc.data('hammer').get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    },

    isToday: function (group) {
      let timeStamp = group.get('timeStamp');
      let today = moment();
      let parsedTimeStamp = moment(timeStamp);

      if (timeStamp === null) return true;

      if (group.get('frequence') === 'once') {
        today = today.format('d/M/Y');
        parsedTimeStamp = parsedTimeStamp.format('d/M/Y');

        if (parsedTimeStamp === today) return true;
      } else if (group.get('frequence') === 'weekly') {
        today = today.format('d');
        parsedTimeStamp = parsedTimeStamp.format('d');

        if (parsedTimeStamp === today) return true;
      }

      return false;
    },

    isTomorrow: function (group) {
      let timeStamp = group.get('timeStamp');
      let tomorrow = moment().add(24, 'hours');
      let parsedTimeStamp = moment(timeStamp);

      if (timeStamp === null) return false;

      if (group.get('frequence') === 'once') {
        tomorrow = tomorrow.format('d/M/Y');
        parsedTimeStamp = parsedTimeStamp.format('d/M/Y');

        if (parsedTimeStamp === tomorrow) return true;
      } else if (group.get('frequence') === 'weekly') {
        tomorrow = tomorrow.format('d');
        parsedTimeStamp = parsedTimeStamp.format('d');

        if (parsedTimeStamp === tomorrow) return true;
      }

      return false;
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (group) {
      let isToday = this.isToday(group);
      let isTomorrow = this.isTomorrow(group);
      let view = new app.GroupView({model: group});

      if (isToday) {
        this.$listToday.append(view.render().el);
      } else if (isTomorrow) {
        this.$listTomorrow.append(view.render().el);
      } else {
        this.$listUpcoming.append(view.render().el);
      }

      // initModal sends the modal intance to each model.
      group.trigger('initModal', this.modalInst);

    },

    // Clears the view and attaches the new collection.
    appendAll: function (collection) {
      this.$listToday.html('');
      this.$listTomorrow.html('');
      this.$listUpcoming.html('');
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
    }

  })

})
