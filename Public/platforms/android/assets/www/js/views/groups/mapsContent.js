// View for the map container.

var app = app || {};
var socket  = loadSocket();

$(function () {

  app.MapsContent = Backbone.View.extend({
    el: '#map-container',

    infoWindowTemplate: Templates.infoWindowMaps,

    template: Templates.contentPlaceholder,

    events: {
      "click .my-location": "pointToUserLocation"
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
      this.listenTo(app.groupCollection, 'updateMarkers', this.updateAll);
      // Temporary disable the markers filtering
      // this.listenTo(app.groupCollection, 'filter', this.filterAll);
      // this.listenTo(app.groupCollection, 'change', this.filterAll);
      this.listenToOnce(app.groupCollection, 'update', this.userCoords);

      this.socket.on('newGroupUpdates', (data) => {
        app.groupCollection.findAndUpdateOneOnline(data);
      });

      this.socket.on('userOffline', (data) => {
        console.log('foo')
        app.groupCollection.userOffline(data);
      });

      this.socket.on('newPendingUpdates', (data) => {
        app.groupCollection.findAndUpdateOnePending(data);
      });

      this.socket.on('userNameUpdate', (data) => {
        app.groupCollection.findAndUpdateGroups(data);
      });
    },

    render: function () {

    },

    userCoords: async function () {
      let that = this;

      try {
        let options = {enableHighAccuracy: true, maximumAge: 5000, timeout: 8000};
        // I add a frequency so that not too many requests are sent to the server.
        // It only runs the function 1 every 3 times watch position gets executed.
        // This fixes bug where watchposition executes too quiclkly the first time.
        let minFrequency = 0;
        let success = (position) => {
          let groups = app.groupCollection;
          let userLat = position.coords.latitude;
          let userLng = position.coords.longitude;
          // Checks if any of the groups entered the online if/else.
          // If none of them entered the condition it means he is none of the
          // groups and therefore the user is online.
          let onlineGroupCheck = 0;

          // Only goes through when minFrequency > 2;
          if (minFrequency < 2){
            minFrequency++;
            return;
           }
          minFrequency = 0;

          that.updateUserLocation(userLat, userLng);

          // For each marker calculates the distance from the user.
          for (let i = 0; groups.length > i; i++) {


            let model = app.groupCollection.models[i];
            let groupLat = model.get('coords').lat;
            let groupLng = model.get('coords').lng;
            let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);

            if (distance <= 0.003) {
              this.socket.emit('userInArea', {
                userId: sessionStorage.getItem('userId'),
                groupId: model.get('_id')
              });
              // keeps track if user is currently online in a group.

              break;
            }
            onlineGroupCheck++
          }

          // This means user is not near any place so it should be put
          // as offline from every group.
          if (onlineGroupCheck === app.groupCollection.length) {
            this.socket.emit('userOffBounds', {
              userId: sessionStorage.getItem('userId')
            })
          }

        };

        let error = (err) => {
          let groupId = app.groupCollection.findGroupId();

          navigator.notification.alert(
            'No se ha podido encontrar tu ubicación. Por favor activa los servicios GPS para poder disfrutar de la app.',
            function () {
              // Searches the user to see if he is online. If he is and his location cant be found,
              // we set the user offline.
              let groupId = app.groupCollection.findGroupId();
              let userId = sessionStorage.getItem('userId')

              if (groupId) {
                this.socket.emit('userOffBounds', {
                  userId: userId,
                  groupId: groupId
                })
              }
            },
            'Activa el GPS'
          );
        }

        // Starts watchPosition
        await navigator.geolocation.watchPosition(success, error, options);

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
        that.userCoords();
      }, function (err) {
        navigator.notification.alert(
          'No se ha podido encontrar tu ubicación. Por favor activa los servicios GPS para poder disfrutar de la app.',
          () => {
            let coords = {lat: 55.948638, lng: -3.201244}
            that.newMap(coords);
            that.userCoords();
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
      let filteredCollection = app.groupCollection.offline();
      this.appendAll(filteredCollection);
      // this.appendAll(app.groupCollection);
    },

    updateAll: function () {
      this.appendAll(app.groupCollection);

      // temporary disable of the markers filtering.
      // this.filterAll(app.groupCollection);
    },

    // Shows placeholder if there is no internet connection.
    connectionError: function () {
      let template = Handlebars.compile(this.template);
      let html = template({placeholder: 'No tienes conexión a internet'});
      this.$el.prepend(html);
      return this;
    },

    // Centers the map in the user location.
    pointToUserLocation: async function () {
      try {
        let that = this;
        let success = (position) => {
          let userLat = position.coords.latitude;
          let userLng = position.coords.longitude;
          let latLng = new google.maps.LatLng(userLat, userLng);
          that.map.panTo(latLng);
        };

        let error = (err) => {
          app.groupCollection.trigger('showSnackBar', {message: 'No se ha podido encontrar tu ubicación'});
        };

        let options = {enableHighAccuracy: true, maximumAge: 5000, timeout: 6000};

        if (this.userCurrentPosition === null) {
          app.groupCollection.trigger('showSnackBar', {message: 'Buscando...'});

          return await navigator.geolocation.getCurrentPosition(success, error, options)
        }
        this.map.panTo(this.userCurrentPosition.getPosition());
      } catch (e) {
        app.groupCollection.trigger('showSnackBar', {message: 'Ha ocurrido un error'})
      }
    }
  })

})
