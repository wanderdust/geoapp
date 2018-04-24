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
      _.bindAll(this, 'userCoords', 'render', 'deviceReady', 'isGpsEnabled', 'pointToUserLocation', 'bgGeolocation', 'onPause', 'onResume');
      this.currentMarkers = [];
      this.userCurrentPosition = null;
      this.socket = socket;

      // Stops map from executing if offline.
      this.listenToOnce(app.groupCollection, 'blankMap', this.newMap);
      this.listenToOnce(app.groupCollection, 'update', this.initMap);
      this.listenToOnce(app.groupCollection, 'update', this.appendAll);
      this.listenTo(app.groupCollection, 'updateMarkers', this.updateAll);
      this.listenTo(app.groupCollection, 'reset', this.appendAll)
      // Temporary disable the markers filtering
      // this.listenTo(app.groupCollection, 'filter', this.filterAll);
      // this.listenTo(app.groupCollection, 'change', this.filterAll);
      this.listenToOnce(app.groupCollection, 'update', this.userCoords);

      this.socket.on('newGroupUpdates', (data) => {
        app.groupCollection.findAndUpdateOneOnline(data);
      });

      this.socket.on('userOffline', (data) => {
        app.groupCollection.userOffline(data);
      });

      this.socket.on('newPendingUpdates', (data) => {
        app.groupCollection.findAndUpdateOnePending(data);
      });

      this.socket.on('userNameUpdate', (data) => {
        app.groupCollection.findAndUpdateGroups(data);
      });

      document.addEventListener("deviceready", this.deviceReady, false);


      this.render();
    },

    render: function () {

    },

    deviceReady: function () {
      document.addEventListener('pause', this.onPause, false);
      document.addEventListener('resume', this.onResume, false);
    },

    // When app is on pause we switch to the background geolocation mode.
    onPause: function () {
      navigator.geolocation.clearWatch(this.positionWatch);
      this.bgGeolocation().start();
    },

    // When app is on foreground we go back to using watchPosition
    onResume: function () {
      this.userCoords();
      this.bgGeolocation().stop();
      // WHen app was in background it didnt update. We check for updates now.
      app.groupCollection.trigger('checkForUpdates');
    },

    bgGeolocation: function ()  {
      try {
        let success = function(position) {

          let groups = app.groupCollection.models.map((model) => {
            let foo = [];
            foo.push(model.get('coords').lat);
            foo.push(model.get('coords').lng);
            foo.push(model.get('_id'))
            return foo;
          });

          let data = {
            lat: position.latitude,
            lng: position.longitude,
            userId: sessionStorage.getItem('userId'),
            groups: groups
          };

          $.post('http://192.168.1.250:1337/location', JSON.stringify(data));

          backgroundGeolocation.finish();
        };

        let error = function(error) {
            return
        };

        // BackgroundGeolocation is highly configurable. See platform specific configuration options
        backgroundGeolocation.configure(success, error, {
            desiredAccuracy: 30,
            stationaryRadius: 0,
            distanceFilter: 0,
            interval: 10000,
            locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,
            startForeground: false
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        return backgroundGeolocation;
      } catch (e) {
        return
      }
    },

    // Checks if Gps is enabled and asks for permission to activate it if it is not.
    isGpsEnabled () {
      let that  = this;
      cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled) {
        if (!enabled) {
          navigator.geolocation.activator.askActivation(function(response) {
            // If user accepts we do a page refresh so that geolocation gets activated.
            window.location.href = "main.html"
          }, function(error) {
            let userId = sessionStorage.getItem('userId')
            // If user declines, we set user offline.
            that.socket.emit('userOffBounds', {
              userId: userId
            })
          });
        }
      }, function(error) {
        navigator.notification.alert(
          e,
          (msg) => true,
          "Ha ocurrido un error:" + error
        );
      });
    },

    userCoords: async function () {
      let that = this;

      try {
        let options = {enableHighAccuracy: true, maximumAge: 5000, timeout: 15000};
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

            // KM
            if (distance <= 0.075) {
              this.socket.emit('userInArea', {
                userId: sessionStorage.getItem('userId'),
                groupId: model.get('_id')
              });
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

        let error = function (err) {
          let userId = sessionStorage.getItem('userId');
          app.groupCollection.trigger('showSnackBar', {message: 'No se ha podido encontrar tu ubicación'});
        }

        // Starts watchPosition
        this.positionWatch = await navigator.geolocation.watchPosition(success, error, options);
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

    newMap: function () {
      try {
        let map =  new google.maps.Map(document.getElementById('map-frame'), {
            center: {lat: 55.948638, lng: -3.201244},
            zoom: 16,
            maxZoom: 16,
            disableDefaultUI: true,
            styles: mapStyle
          });
        this.map = map;
        // Point To user location checks if the GPS is enabled, and takes action.
        // also it points to the user position once it has the position.
        document.addEventListener("deviceready", this.pointToUserLocation, false);

        return map;
      } catch (e) {
        this.connectionError();
      }
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
          that.updateUserLocation(userLat, userLng);
          $('.my-location').removeClass('disabled').html(Templates.myLocation);
        };

        let error = (err) => {
          $('.my-location').removeClass('disabled').html(Templates.myLocation);
          app.groupCollection.trigger('showSnackBar', {message: 'No se ha podido encontrar tu ubicación'});
        };

        let options = {enableHighAccuracy: true, maximumAge: 5000, timeout: 15000};

        // Checks if Gps is enabled. If it is it pans to user position.
        // if it is not it executes isGpsEnabled();
        cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            if (enabled) {
              if (that.userCurrentPosition === null) {
                $('.my-location').html(Templates.preloaderBlue);
                return navigator.geolocation.getCurrentPosition(success, error, options);
              }
              that.map.panTo(that.userCurrentPosition.getPosition());
              $('.my-location').removeClass('disabled').html(Templates.myLocation);
            } else {
              that.isGpsEnabled();
              $('.my-location').removeClass('disabled').html(Templates.myLocation);
            }
        }, function(error){
            alert("The following error occurred: "+error);
        });
      } catch (e) {
        app.groupCollection.trigger('showSnackBar', {message: 'Ha ocurrido un error'})
      }
    }
  })

})
