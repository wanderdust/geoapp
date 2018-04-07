// View of the whole users app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.MyFriendsView = Backbone.View.extend({
    el: '#sidebar-container',

    events: {
      "click .back-arrow-container": "backToMain",
      "click .search-icon": "toggleScaleOut",
      "keyup .friends-query" : "search"
    },

    initialize: function () {
      this.socket = socket;
      let userId = sessionStorage.getItem('userId');
      new app.UserList();

      this.listenTo(app.userCollection, 'add', this.render);

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', userId);



      this.loadCache();

      this.socket.emit('createFriendsCollection', userId, (err, collection) => {
        if (err) {
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );
        }
        // If localStorage doesnt exist we load from http request.
        if (localStorage.getItem('friendsCache_geoApp') === null) {
          app.userCollection.add(collection);
        } else {
          app.userCollection.reset(collection);
        }

      });


      this.render();
    },

    render: function (ff) {
      let friendsLength = app.userCollection.length;
      $('.friends-length span').html(friendsLength);
    },

    loadCache: function () {
      let cache = JSON.parse(localStorage.getItem('friendsCache_geoApp'));
      app.userCollection.add(cache);
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    search: function () {
      app.userCollection.trigger('search');
    },

    toggleScaleOut: function (defaultParam, isState) {
      let isHasClass = $('.header-nav').hasClass('search-tab');

      if (typeof(isState) !== 'undefined')
        isHasClass = isState;

      $('.header-nav').toggleClass('search-tab', !isHasClass);
      $('.chevron-orange').toggleClass('scale-out', isHasClass);
      $('.chevron-white').toggleClass('scale-out', !isHasClass);
      $('.glass-orange').toggleClass('scale-out', !isHasClass);
      $('.search-input .friends-query').toggleClass('scale-out', isHasClass);
      $('.search-input .search-icon').toggleClass('scale-out', isHasClass);
      $('.title-container div').toggleClass('scale-out', !isHasClass);
      $('.title-container p').toggleClass('scale-out', !isHasClass);

      if (!isHasClass) {
        $('.friends-query').focus();
      } else {
        this.$('.friends-query').val('');
        app.userCollection.trigger('search');
      }
    }

  });

  new app.MyFriendsView();
})
