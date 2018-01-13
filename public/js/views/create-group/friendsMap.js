// View of the whole map app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendsMap = Backbone.View.extend({
    el: '#map-container-friends',

    events: {

    },

    initialize: function () {

      this.getUserLocation();
      this.currentMarkers = [];

    },

    render: function () {

    },

    // Function to init google maps.
    initMap: function (userCoords) {
      let coords = {};
      let that = this;
      let map = new google.maps.Map(document.getElementById('map-container-friends'), {
        center: {lat: userCoords.lat, lng: userCoords.lng},
        zoom: 8,
        disableDefaultUI: true,
        styles: mapStyle
      });
      this.map = map;
      // Places the marker and sends coords to the main view.
      this.map.addListener('click', function(e) {
          that.placeMarker(e.latLng, map);
          coords.lat = e.latLng.lat();
          coords.lng = e.latLng.lng();
          app.userCollection.trigger('groupCoords', coords);
      });

      this.searchbox(map);
    },

    searchbox: function (map) {
      let that = this;
      // Create the search box and link it to the UI element.
      let input = document.getElementById('pac-input');
      let searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener('places_changed', function() {
        let places = searchBox.getPlaces();
        let place = places[0];
        let coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }

        if (places.length == 0) {
          return;
        }

        // For each place, get the icon, name and location.
        let bounds = new google.maps.LatLngBounds();
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        };

        // Create a marker for each place.
        // Clear out the old markers.
        that.placeMarker(place.geometry.location, map);
        app.userCollection.trigger('groupCoords', coords);

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);
      });
    },

    // Gets the user current location to set as center of map.
    getUserLocation: function () {
      let that = this;
      if (!navigator.geolocation)
        return console.log('Geolocation not supported');

      navigator.geolocation.getCurrentPosition(function (position) {
        let coords = {};
        coords.lat = position.coords.latitude;
        coords.lng = position.coords.longitude;
        that.initMap(coords);
      }, function (err) {
        let coords = {lat: 55.948638, lng: -3.201244}
        that.initMap(coords)
      });
    },

    // Places a marker.
    placeMarker: function(position, map) {
      this.removeMarkers();
      let marker = new google.maps.Marker({
          position: position,
          map: map
      });
      map.panTo(position);
      this.currentMarkers.push(marker);
      console.log(this.currentMarkers)
    },

    // Removes all markers.
    removeMarkers: function () {
      for(let i = 0; i < this.currentMarkers.length; i++){
        this.currentMarkers[i].setMap(null);
      }
      this.currentMarkers = [];
    },

  })
});
