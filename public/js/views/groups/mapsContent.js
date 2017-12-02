// View for the map container.

var app = app || {};

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    infoWindowTemplate: Handlebars.compile($('#info-window-template').html()),

    events: {

    },

    initialize: function () {
      _.bindAll(this, 'userCoords');
      this.currentMarkers = [];
      this.socket = io();

      this.listenToOnce(app.groupCollection, 'update', this.initMap);
      this.listenToOnce(app.groupCollection, 'update', this.appendAll);
      this.listenTo(app.groupCollection, 'filter', this.filterAll);
      this.listenTo(app.groupCollection, 'change', this.filterAll);

      this.userCoords();
      setInterval(this.userCoords, 10000);
    },

    render: function () {

    },

    userCoords: async function () {
      if (!navigator.geolocation)
        return console.log('Geolocation not supported by your browser');

      return await navigator.geolocation.getCurrentPosition((position) => {
        let groups = app.groupCollection;
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        for (let i = 0; app.groupCollection.length > i; i++) {
          let model = app.groupCollection.models[i];
          let groupLat = model.get('coords').lat;
          let groupLng = model.get('coords').lng;
          let groupLatLng = new google.maps.LatLng(groupLat, groupLng);
          let userLatLng = new google.maps.LatLng(lat, lng)

          let distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, groupLatLng);

          if (distance <= 1715145) {
            console.log('User online in group ' + model.get('title'));

            this.socket.emit('userInRange', model);
          }
        }
      })
    },

    filterAll: function (collection) {
      if (app.GroupFilter === "online") {
        return this.showOnlineMarkers();
      } else if (app.GroupFilter === "pending") {
        return this.showPendingMarkers();
      }
      return this.showAllMarkers();
    },

    getCenter: function (collection) {
      let locations = collection.pluck('coords');
      let bound = new google.maps.LatLngBounds();

      for (let i = 0; i < locations.length; i++) {
        let myLatLng = new google.maps.LatLng(locations[i].lat, locations[i].lng)
        bound.extend(myLatLng);
      };
      return {
        coords: bound.getCenter(),
        bound
      };
    },

    // Inits google maps.
    initMap: function () {
      let center = this.getCenter(app.groupCollection).coords;
      let bounds = this.getCenter(app.groupCollection).bound;
      let coords = {lat: center.lat(), lng: center.lng()}

      let map = new google.maps.Map(document.getElementById('map-frame'), {
          center: coords,
          disableDefaultUI: true,
          styles: mapStyle
        });
      map.fitBounds(bounds);
      this.map = map;
    },

    // Creates and renders new Markers.
    appendMarker: function (model, icon) {
      let marker = new google.maps.Marker({
          position: {lat: model.get('coords').lat, lng: model.get('coords').lng},
          map: this.map,
          icon
      });
      this.currentMarkers.push(marker);

      let infoWindow = new google.maps.InfoWindow({
          content: this.infoWindowTemplate({title: model.get('title')})
        });
      infoWindow.open(this.map, marker);

      return marker
    },

    appendMarkerByColor: function (model) {
      if (model.get('activeUsers').length > 0) {
        return this.appendMarker(model, '../../css/assets/green_marker.png');
      } else if (model.get('pendingUsers').length > 0) {
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
      this.currentMarkers = [];
      collection.each(this.appendMarkerByColor, this);
    },

    showOnlineMarkers: function () {
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
