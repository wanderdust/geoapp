// View for the map container.

var app = app || {};

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    infoWindowTemplate: Handlebars.compile($('#info-window-template').html()),

    events: {
      "click .openbtn": "openSidebar",
      "click .closebtn": "closeSidebar",
      "swipeleft #sidebar-container": "closeSidebar"
    },

    initialize: function () {
      _.bindAll(this, 'closeSidebar');
      this.$sideNav = $('#sidebar-container');
      this.currentMarkers = [];
      this.map = this.initMap();

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
    initMap: function () {
      return new google.maps.Map(document.getElementById('map-frame'), {
          zoom: 13,
          center: {lat: 55.948597, lng: -3.198781},
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
      this.currentMarkers.push(marker);

      new google.maps.InfoWindow({
          content: this.infoWindowTemplate({title: model.get('title')})
        }).open(this.map, marker);
    },

    appendMarkerByColor: function (model) {
      if (model.get('activeUsers').length) {
        return this.appendMarker(model, '../../css/assets/green_marker.png');
      } else if (model.get('pending')) {
        return this.appendMarker(model, '../../css/assets/red_pending_marker.png');
      }
      return this.appendMarker(model, '../../css/assets/red_marker.png');
    },

    removeMarkers: function () {
      for(let i = 0; i < this.currentMarkers.length; i++){
        this.currentMarkers[i].setMap(null);
      }
    },

    appendAll: function (collection) {
      this.removeMarkers();
      collection.each(this.appendMarkerByColor, this)
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
