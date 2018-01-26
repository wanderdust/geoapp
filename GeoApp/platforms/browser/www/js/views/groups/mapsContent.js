// View for the map container.

var app = app || {};
var socket  = socket || io.connect('https://geo-app-amigos.herokuapp.com');

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
      this.socket = socket;

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

      this.socket.on('newPendingUpdates', (data) => {
        app.groupCollection.findAndUpdateOnePending(data);
      })

      setInterval(this.userCoords, 2000);
    },

    render: function () {

    },

    userCoords: async function () {
      // // Provisional fixed coords for testing.
      // let groups = app.groupCollection;
      // let userLat = randomCoords().lat;
      // let userLng = randomCoords().lng;
      //
      // for (let i = 0; groups.length > i; i++) {
      //   let model = app.groupCollection.models[i];
      //   let groupLat = model.get('coords').lat;
      //   let groupLng = model.get('coords').lng;
      //   let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);
      //
      //   if (distance <= 0.5) {
      //     this.socket.emit('userInArea', {
      //       userId: sessionStorage.getItem('userId'),
      //       groupId: model.get('_id')
      //     });
      //     break;
      //   }
      // }

      try {
        if (!navigator.geolocation)
          return console.log('Geolocation not supported by your browser');

        // await navigator.geolocation.getCurrentPosition
        await navigator.geolocation.watchPosition((position) => {
          let groups = app.groupCollection;
          let userLat = position.coords.latitude;
          let userLng = position.coords.longitude;

          // For each marker calculates the distance from the user.
          for (let i = 0; groups.length > i; i++) {
            let model = app.groupCollection.models[i];
            let groupLat = model.get('coords').lat;
            let groupLng = model.get('coords').lng;
            let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);

            if (distance <= 0.05) {
              this.socket.emit('userInArea', {
                userId: sessionStorage.getItem('userId'),
                groupId: model.get('_id')
              });
              break;
            }
          }
        })
      } catch (e) {
        console.log(e)
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
        that.initMap(coords);
      }, function (err) {
        let coords = {lat: 55.948638, lng: -3.201244}
        that.newMap(coords)
      })
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
        return this.appendMarker(model, 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|4aa710');
      } else if (model.get('pendingUsers').length > 0) {
        return this.appendMarker(model, '../../css/assets/pending_marker.png');
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
