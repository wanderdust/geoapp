// View of the entire groups window.

var app = app || {};
var socket  = loadSocket();


$(function () {
  app.GroupsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.badge,

    events: {
      "click .requests-btn": "getRequests",
      "click .pending-btn": "getPending",
      "click .new-group-btn": "getNewGroup",
      "click .friends-add-btn": "getAddFriends",
      "click .friend-requests-btn": "getFriendRequests",
      "click .settings-btn": "getSettings"
    },

    initialize: function () {
      _.bindAll(this, 'render', 'getRequestsLength');
      this.socket = socket;
      this.$sideNav = $('#sidebar-container');

      this.listenTo(app.groupCollection, 'showSnackBar', this.snackBar);
      this.listenTo(app.groupCollection, 'checkForUpdates', this.updateGroupCollection);

      new app.TabsContent();
      new app.MapsContent();

      var elem = document.querySelector('.sidenav');
      var instance = M.Sidenav.init(elem, {});

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      // Appends new notifications.
      socket.on('addNewRequest', () => this.getRequestsLength());

      // LoadCache loads local saved locally.
      this.loadCache();
      this.render();
      this.getRequestsLength();
    },

    render: function () {
      let that = this;
      this.$sideNav.hammer();

      this.socket.emit('createGroupCollection', {
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if(err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // If it is a new user with no groups it triggers blankMap event.
        if (collection.length === 0) {
          app.groupCollection.trigger('blankMap')
        } else {
          // If localStorage doesnt exist we load from http request.
          if (localStorage.getItem('groupsCache_geoApp') === null) {
            app.groupCollection.add(collection);
          } else {
            app.groupCollection.reset(collection);
          }
        }
        that.saveDataLocally(collection);
      });
    },

    // Loads the data from the localStorage.
    loadCache: function () {
      let cache = JSON.parse(localStorage.getItem('groupsCache_geoApp'));
      app.groupCollection.add(cache);
    },

    // Saves the data from this session to the localStorage.
    saveDataLocally: function (collection) {
      let groupCollection = collection.map((e) => {
        let data = {
          title: e.title,
          coords: e.coords,
          groupImage: '',
          activeUsers: [],
          pendingUsers: [],
          _id: e._id
        };
        return data;
      });
      groupCollection = JSON.stringify(groupCollection);
      localStorage.setItem('groupsCache_geoApp', groupCollection);
    },

    // Gets the user's request length, to show notifications in the side-bar.
    getRequestsLength: function () {
      let requestLength;
      let userId = sessionStorage.getItem('userId');
      this.socket.emit('createRequestCollection', userId, (err, collection) => {
        if (err)
          return

        requestLength = collection.length;
        if (requestLength > 0)
          this.showBadge(requestLength);
      });
    },

    // Gets a brand new group collection
    updateGroupCollection: function () {
      this.socket.emit('createGroupCollection', {
        userId: sessionStorage.getItem('userId')
      }, (err, collection) => {
        if(err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );
          app.groupCollection.set(collection, {add: false, remove: false, merge: true});
          // app.groupCollection.reset(collection);
      });
    },

    // Appends notifications to the requests li element.
    showBadge: function (requestLength) {
      let template = Handlebars.compile(this.template);
      let html = template({requestLength});

      this.$('.list-notification').remove();
      this.$('.requests').append(html);
    },

    getRequests: function () {
      window.location.href = "requests.html"
    },

    getPending: function () {
      window.location.href = "pending.html"
    },

    getNewGroup: function () {
      window.location.href = "create-group.html"
    },

    getAddFriends: function () {
      window.location.href = "my-friend-list.html"
    },

    getFriendRequests: function () {
      window.location.href = "friend-requests.html"
    },

    getSettings: function () {
      window.location.href = "settings.html"
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message.message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  });

  var registerFCM = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        registerFCM.setupPush();
        registerFCM.colorStatusBar();
    },
    setupPush: function() {
        var push = PushNotification.init({
            "android": {
                "senderID": "97678348194",
                "icon": "../../../../res/icon/android/icon-36-ldpi2.png",
                "iconColor": "#FF6600"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });

        push.on('registration', function(data) {
          // Post registrationId to your app server as the value has changed
          socket.emit('updateUserFcmId', {
            regId: data.registrationId,
            userId: sessionStorage.getItem('userId')
          })
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });
    },

    colorStatusBar: function () {
      // IN case it doesnt fire on start, we have a backup here.
      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#b47916");
      }
    }
};

  new app.GroupsView();
  registerFCM.initialize();
})
