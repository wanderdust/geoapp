// View for the map container.

var app = app || {};
var socket  = loadSocket();

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    infoWindowTemplate: Templates.infoWindowMaps,

    template: Templates.contentPlaceholder,

    events: {

    },

    initialize: function () {
      _.bindAll(this, 'userCoords');
      this.currentMarkers = [];
      this.userCurrentPosition = null;
      this.socket = socket;
      // Starts with true to check all paths in the if/else statement.
      this.userIsOnline = true;

      // Stops map from executing if offline.
      this.listenToOnce(app.groupCollection, 'blankMap', this.blankMap);
      this.listenToOnce(app.groupCollection, 'update', this.initMap);
      this.listenToOnce(app.groupCollection, 'update', this.appendAll);
      this.listenTo(app.groupCollection, 'updateMarkers', this.updateAll)
      this.listenTo(app.groupCollection, 'filter', this.filterAll);
      this.listenTo(app.groupCollection, 'change', this.filterAll);
      this.listenToOnce(app.groupCollection, 'update', this.userCoords);

      this.socket.on('newGroupUpdates', (data) => {
        app.groupCollection.findAndUpdateOneOnline(data);
      });

      this.socket.on('userOffBounds', (data) => {
        app.groupCollection.userOffline(data);
      });

      this.socket.on('newPendingUpdates', (data) => {
        app.groupCollection.findAndUpdateOnePending(data);
      });
    },

    render: function () {

    },

    userCoords: async function () {
      let that = this;
      try {
        if (!navigator.geolocation)
          return navigator.notification.alert(
            'Geolocation not supported',
            (msg) => true,
            'Error'
          );
        // await navigator.geolocation.getCurrentPosition
        await navigator.geolocation.watchPosition((position) => {
          let groups = app.groupCollection;
          let userLat = position.coords.latitude;
          let userLng = position.coords.longitude;
          that.updateUserLocation(userLat, userLng)

          // For each marker calculates the distance from the user.
          for (let i = 0; groups.length > i; i++) {
            let model = app.groupCollection.models[i];
            let groupLat = model.get('coords').lat;
            let groupLng = model.get('coords').lng;
            let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);

            if (distance <= 0.030) {
              this.socket.emit('userInArea', {
                userId: sessionStorage.getItem('userId'),
                groupId: model.get('_id')
              });
              // keeps track if user is currently online in a group.
              this.userIsOnline = true;
              break;
            } else if (this.userIsOnline) {
              // This means user is not near any place so it should be put
              // as offline from every group.
              this.userIsOnline = false;
              this.socket.emit('userOffBounds', {
                userId: sessionStorage.getItem('userId'),
                groupId: model.get('_id')
              })
            }
          }
        }, (err) => {
          navigator.notification.alert(
            'No se ha podido encontrar tu ubicación. Por favor activa los servicios GPS para poder disfrutar de la app.',
            () => {},
            'Activa el GPS'
          );
        }, {enableHighAccuracy: true, maximumAge: 5000, timeout: 5000});

      } catch (e) {
        return navigator.notification.alert(
          e,
          (msg) => true,
          'Error'
        );
      }
    },

    updateUserLocation: function (lat, lng) {
      let newPoint = new google.maps.LatLng(lat, lng);
      if (this.userCurrentPosition == null) {
        this.userCurrentPosition = new google.maps.Marker({
          position: newPoint,
          map: this.map,
          icon: "css/assets/sidebar-icons/icon_current_pos.svg"
        });
      } else {
        this.userCurrentPosition.setPosition(newPoint);
      }
    },

    getDistanceFromLatLonInKm: function (lat1,lon1,lat2,lon2) {
      var p = 0.017453292519943295;    // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((lat2 - lat1) * p)/2 +
              c(lat1 * p) * c(lat2 * p) *
              (1 - c((lon2 - lon1) * p))/2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
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

    newMap: function (coords) {
      try {
        let map =  new google.maps.Map(document.getElementById('map-frame'), {
            center: coords,
            zoom: 8,
            disableDefaultUI: true,
            styles: mapStyle
          });
        this.map = map;
        return map;
      } catch (e) {
        this.connectionError();
      }
    },

    // Creates a new map with the center at the user's current location.
    blankMap: async function () {
      let that = this;
      if (!navigator.geolocation)
        return console.log('Geolocation not supported by your browser');

      await navigator.geolocation.getCurrentPosition(function (position) {
        let coords = {};
        coords.lat = position.coords.latitude;
        coords.lng = position.coords.longitude;
        that.newMap(coords);
      }, function (err) {
        navigator.notification.alert(
          'No se ha podido encontrar tu ubicación. Por favor activa los servicios GPS para poder disfrutar de la app.',
          () => {
            let coords = {lat: 55.948638, lng: -3.201244}
            that.newMap(coords)
          },
          'Activa el GPS'
        );
      }, {enableHighAccuracy: true, maximumAge: 5000, timeout: 5000})
    },

    // Inits google maps.
    initMap: function () {
      try {
        let center = this.getCenter(app.groupCollection).coords;
        let bounds = this.getCenter(app.groupCollection).bound;
        let coords = {lat: center.lat(), lng: center.lng()}

        let map = this.newMap(coords);
        map.fitBounds(bounds);
      } catch (e) {
        this.connectionError();
      }
    },

    // Creates and renders new Markers.
    appendMarker: function (model, icon) {
      // Handles google is not defined error when offline.
      if (typeof google !== 'undefined') {
        let marker = new google.maps.Marker({
            position: {lat: model.get('coords').lat, lng: model.get('coords').lng},
            map: this.map,
            icon
        });
        this.currentMarkers.push(marker);

        let infoWindowTemplate = Handlebars.compile(this.infoWindowTemplate);
        let infoWindow = new google.maps.InfoWindow({
            content: infoWindowTemplate({title: model.get('title')})
          });
        infoWindow.open(this.map, marker);

        return marker
      } else {
        return
      }
    },

    appendMarkerByColor: function (model) {
      if (model.get('activeUsers').length > 0) {
        return this.appendMarker(model, 'css/assets/green_marker.svg');
      } else if (model.get('pendingUsers').length > 0) {
        return this.appendMarker(model, 'css/assets/pending_marker.svg');
      }
      return this.appendMarker(model, 'css/assets/offline_marker.svg');
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
    },

    updateAll: function () {
      this.appendAll(app.groupCollection);
      this.filterAll(app.groupCollection);
    },

    connectionError: function () {
      let template = Handlebars.compile(this.template);
      let html = template({placeholder: 'No tienes conexión a internet'});
      this.$el.prepend(html);
      return this;
    }
  })

})
