// View of the whole pending app.

var app = app || {};
var socket = socket || io();

$(function () {

  app.FriendsMap = Backbone.View.extend({
    el: '#map-container-friends',

    events: {

    },

    initialize: function () {
      this.listenToOnce(app.userCollection, 'update', this.initMap);
    },

    render: function () {

    },

    // Inits google maps.
    initMap: function () {
      new google.maps.Map(document.getElementById('map-container-friends'), {
          center: {lat: 0, lng: 0},
          disableDefaultUI: true,
          style: mapStyle
      });
    }

  })
});
