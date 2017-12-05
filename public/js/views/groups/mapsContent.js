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
      this.listenTo(app.groupCollection, 'modelUpdate', this.findAndUpdate);

      setTimeout(this.userCoords, 4500);
      setInterval(this.userCoords, 6000);
    },

    render: function () {

    },

    userCoords: async function () {

      // Provisional fixed coords for testing.
      let groups = app.groupCollection;
      let userLat = randomCoords().lat;
      let userLng = randomCoords().lng;

      for (let i = 0; groups.length > i; i++) {
        let model = app.groupCollection.models[i];
        let groupLat = model.get('coords').lat;
        let groupLng = model.get('coords').lng;

        let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);
        console.log(distance)
        if (distance <= 0.30) {
          this.socket.emit('userInArea', {
            userId: sessionStorage.getItem('userId'),
            groupId: model.get('_id')
          }, (err, data) => {
            if (err)
              return console.log(err);

            app.groupCollection.trigger('modelUpdate', data)
          })
        }
      }

      // // Geolocation is broken??
      // if (!navigator.geolocation)
      //   return console.log('Geolocation not supported by your browser');

      // await navigator.geolocation.getCurrentPosition((position) => {
      //   let groups = app.groupCollection;
      //   let userLat = position.coords.latitude;
      //   let userLng = position.coords.longitude;
      //
      //   for (let i = 0;groups.length > i; i++) {
      //     let model = app.groupCollection.models[i];
      //     let groupLat = model.get('coords').lat;
      //     let groupLng = model.get('coords').lng;
      //
      //     let distance = this.getDistanceFromLatLonInKm(userLat, userLng, groupLat, groupLng);
      //     console.log(distance);
      //     if (distance <= 20) {
      //       this.socket.emit('userInArea', {
      //         userId: sessionStorage.getItem('userId'),
      //         groupId: model.get('_id')
      //       }, (err, collection) => {
      //
      //       })
      //     }
      //   }
      // }, function (err) {
      //   console.log(err.message);
      // })
    },

    getDistanceFromLatLonInKm: function (lat1,lon1,lat2,lon2) {
      var p = 0.017453292519943295;    // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((lat2 - lat1) * p)/2 +
              c(lat1 * p) * c(lat2 * p) *
              (1 - c((lon2 - lon1) * p))/2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    },

    findAndUpdateOne: function (data) {
      // Updates the activeUsers array in the models.
      let model = app.groupCollection.findWhere({_id: data._id});
      let onlineUsersArray = model.get('activeUsers');

      let index = onlineUsersArray.indexOf(data.userOnline);

      if (index === -1) {
        onlineUsersArray.push(data.userOnline);
        model.set({activeUsers: onlineUsersArray});
      } else {
        onlineUsersArray.splice(index, 1);
        model.set({activeUsers: onlineUsersArray});
      }
      app.groupCollection.set({model}, {add: false, remove: false, merge: true});
      model.trigger('render');
    },

    findAndUpdate: function (elements) {
      elements.forEach(this.findAndUpdateOne, this)
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
