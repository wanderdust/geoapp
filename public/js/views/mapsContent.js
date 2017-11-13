var app = app || {};

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    events: {
      "click .openbtn": "openSidebar",
      "click .closebtn": "closeSidebar"
    },

    initialize: function () {
      _.bindAll(this, 'closeSidebar');

      this.$sideNav = $('#sidebar-container');

      this.render();
    },

    render: function () {
      this.$sideNav.hammer().on("swipeleft", this.closeSidebar);
    },

    openSidebar: function () {
      this.$sideNav.addClass('swipeIt');
    },

    closeSidebar: function () {
      this.$sideNav.removeClass('swipeIt');
    }
  })

})
