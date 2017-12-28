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
          app.userCollection.trigger('groupCoords', coords)
      })
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
        var marker = new google.maps.Marker({
            position: position,
            map: map
        });
        map.panTo(position);
        this.currentMarkers.push(marker)
    },
    // Removes all markers.
    removeMarkers: function () {
      for(let i = 0; i < this.currentMarkers.length; i++){
        this.currentMarkers[i].setMap(null);
      }
    },

  })
});
