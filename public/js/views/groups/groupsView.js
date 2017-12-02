// View of the entire groups window.

var app = app || {};

$(function () {
  app.GroupsView = Backbone.View.extend({
    el: '#app-container',

    events: {
      "click .openbtn": "openSidebar",
      "click .closebtn": "closeSidebar",
      "swipeleft #sidebar-container": "closeSidebar",
      "click .requests-btn": "getRequests"
    },

    initialize: function () {
      _.bindAll(this, 'render', 'closeSidebar');
      this.socket = io();
      this.$sideNav = $('#sidebar-container');

      this.render();
    },

    render: function () {
      this.$sideNav.hammer();

      new app.MapsContent();
      new app.TabsContent();

      this.socket.emit('createGroupCollection', {
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if(err)
          return console.log(err);

        app.groupCollection.add(collection);
      })
    },

    openSidebar: function () {
      this.$sideNav.addClass('swipeIt');
    },

    closeSidebar: function () {
      this.$sideNav.removeClass('swipeIt');
    },

    getRequests: function () {
      window.location.href = "/requests.html"
    }
  })
})
