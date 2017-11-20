// View for the map container.

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
      this.currentMarkers = [];

      this.listenTo(app.groupCollection, 'showAll', this.showAllMarkers);
      this.listenTo(app.groupCollection, 'showOnline', this.showOnlineMarkers);
      this.listenTo(app.groupCollection, 'showPending', this.showPendingMarkers);
      this.listenTo(app.groupCollection, 'add', this.appendMarkerByColor);

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

    // Inits google maps.
    //Plantearse crear un modelo aparte para Maps.
    initMap: function () {
      return new google.maps.Map(document.getElementById('map-frame'), {
          zoom: 13,
          center: {lat: 40.472841, lng: -3.868697},
          disableDefaultUI: true
        });
    },

    // Creates and renders new Markers.
    appendMarker: function (model, icon) {
      let marker = new google.maps.Marker({
          position: {lat: model.get('coords').lat, lng: model.get('coords').lng},
          map: this.map,
          icon
      });
      this.currentMarkers.push(marker)
    },

    appendMarkerByColor: function (model) {
      if (model.get('activeUsers').length) {
        return this.appendMarker(model, 'http://maps.google.com/mapfiles/ms/icons/green.png');
      } else if (model.get('pending')) {
        return this.appendMarker(model, 'http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      }
      return this.appendMarker(model, 'http://maps.google.com/mapfiles/ms/icons/red.png');
    },

    appendAll: function (collection) {
      this.removeMarkers();
      collection.each(this.appendMarkerByColor, this)
    },

    removeMarkers: function () {
      for(let i = 0; i < this.currentMarkers.length; i++){
        this.currentMarkers[i].setMap(null);
      }
    },

    showOnlineMarkers: function (foo) {
      let filteredCollection = app.groupCollection.online();
      this.appendAll(filteredCollection);
    },

    showPendingMarkers: function () {
      let filteredCollection = app.groupCollection.pending();
      this.appendAll(filteredCollection);
    },

    showAllMarkers: function () {
      this.appendAll(app.groupCollection);
    }
  })

})
