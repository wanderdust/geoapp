// View of the whole map app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.FriendsMap = Backbone.View.extend({
    el: '#map-container-friends',

    template: Templates.contentPlaceholder,

    events: {

    },

    initialize: function () {

      this.getUserLocation();
      this.initMap();
      this.currentMarkers = [];

    },

    render: function () {

    },

    // Function to init google maps.
    initMap: async function () {
      // If offline google throws error.
      try {
        let coords = {};
        let that = this;
        let map = await new google.maps.Map(document.getElementById('map-container-friends'), {
          center: {lat: 40.472795, lng: -3.868239},
          zoom: 12,
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
        await this.getUserLocation(map);
      } catch (e) {
        let template = Handlebars.compile(this.template);
        let html = template({placeholder: 'No tienes conexión a internet'});
        this.$el.html(html);
        return this;
      }
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
          return navigator.notification.alert(
            'Returned place contains no geometry',
            (msg) => true,
            'Error'
          );
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
    getUserLocation: async function (map) {
      await navigator.geolocation.getCurrentPosition(function (position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        let latLng = new google.maps.LatLng(lat, lng);
        map.panTo(latLng);
      }, function (err) {
          return
      }, {enableHighAccuracy: true, maximumAge: 5000, timeout: 3500});
    },

    // Places a marker.
    placeMarker: function(position, map) {
      this.removeMarkers();
      let marker = new google.maps.Marker({
          position: position,
          map: map,
          icon: 'css/assets/red_marker.svg'
      });
      map.panTo(position);
      this.currentMarkers.push(marker);
      // Gets the focus out the searchBox to hide the keyboard.
      $('#pac-input').blur();
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
