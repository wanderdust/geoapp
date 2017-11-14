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
      this.map = this.initMap();

      this.listenTo(app.groupCollection, 'add', this.appendMarker);
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

    //Plantearse crear un modelo aparte para Maps.
    initMap: function () {
      return new google.maps.Map(document.getElementById('map-frame'), {
          zoom: 14,
          center: {lat: 40.472841, lng: -3.868697},
          disableDefaultUI: true
        });
    },

    appendMarker: function (model) {
      new google.maps.Marker({
          position: {lat: model.get('coords').lat, lng: model.get('coords').lng},
          map: this.map,
      })
    },
  })

})
