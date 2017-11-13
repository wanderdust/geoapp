var app = app || {};

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    events: {
      "click .openbtn": "openSidebar",
      "click .closebtn": "closeSidebar",
      "swipeleft #sidebar-container": "closeSidebar"
    },

    initialize: function () {
      _.bindAll(this, 'closeSidebar');

      this.$sideNav = $('#sidebar-container');
      this.initMap();
      this.render();

    },

    render: function () {
      this.$sideNav.hammer();
    },

    openSidebar: function () {
      this.$sideNav.addClass('swipeIt');
    },

    closeSidebar: function () {
      this.$sideNav.removeClass('swipeIt');
    },

    initMap: function () {
      let map =  new google.maps.Map(document.getElementById('map-frame'), {
          zoom: 15,
          center: {lat: 40.476552, lng: -3.880276},
          disableDefaultUI: true
        });

      let marker = new google.maps.Marker({
          position: {lat: 40.476552, lng: -3.880276},
          map: map
        });
    }
  })

})
