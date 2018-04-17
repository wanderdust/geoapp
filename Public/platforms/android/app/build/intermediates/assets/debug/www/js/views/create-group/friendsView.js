// View of the whole friends/users app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.FriendsView = Backbone.View.extend({
    el: 'body',

    events: {
      "click #back-arrow-container": "backToMain",
      "click .back-arrow-container.cg": "closeNavAndSave",
      "click .back-arrow-container.af": "backToUsers",
      "click .continue-btn.cg": "closeNavAndSave",
      "click .continue-btn.af": "sendInvitation",
      "click .add-friends-btn": "openNavBar",
      "keyup .friends-query" : "search",
      "click #create-group-btn": "createNewGroup",
      "click .new-group-image-container" : "addGroupImage",
      "swiperight .tabs-content.groups-sidebar": "closeNavAndSave",
      "click .search-icon": "toggleScaleOut",
      "click .group-frequence input": "addFrequence",
      "click .timepicker": "blurOut",
      "click .timepicker-modal": "blurOut"
    },

    initialize: function () {
      _.bindAll(this, 'addGroupImage')
      this.socket = socket;
      this.groupCoords;
      this.groupFriends = [];
      this.groupImage = "";
      this.groupDate;
      this.groupTime;
      this.groupFrequence = "once"
      this.$sideNav = $('.status-users-content');
      this.$btn = $('#create-group-btn');


      this.listenTo(app.userCollection, 'showAlert', this.snackBar);
      this.listenTo(app.userCollection, 'groupCoords', this.updateCoords);
      this.listenTo(app.userCollection, 'groupFriends', this.updateFriends);

      new app.FriendList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      if (this.getUrl() === "create-group.html") {
        new app.FriendsMap();
        new app.AddedFriendList();
      }


      this.render();
    },

    render: function () {
      this.$sideNav.hammer();
      let options = datePickerOptions

      // Date-picker initialize
      let elemDate = document.querySelector('.datepicker');
      let instanceDate = M.Datepicker.init(elemDate, options);

      // Time-picker initialize
      let elemTime = document.querySelector('.timepicker');
      let instanceTime = M.Timepicker.init(elemTime, options);
    },

    // Gets the url of the current document to use only some of the js/files
    getUrl: function () {
      let file = window.location.href.split('/').pop();
      return file.split('#').shift();
    },

    // Adds the class active to the sidebar to open it.
    openNavBar: function () {
      this.$('.friends-query').val("");
      this.$('#sidebar-container').addClass('active');
      this.$('#app-container.group-add').addClass('active');
      this.$el.addClass('scroll-fix');
      app.userCollection.trigger('search');
    },

    // In the sidebar when clicked the green button saves the friends selected.
    closeNavAndSave: function () {
      this.$('#sidebar-container').removeClass('active');
      this.$('#app-container.group-add').removeClass('active');
      this.$('.friends-query').blur();
      // sets overflow to hidden
      this.$el.removeClass('scroll-fix');
      this.toggleScaleOut(null, true)
    },

    // go back to the users (users.html)
    backToUsers: function () {
      window.location.href = 'users.html';
    },

    // Back to home.
    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    // For showing messages.
    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    },

    // Triggers search to show/hide users when introducing a query.
    search: function () {
      app.userCollection.trigger('search');
    },

    // Saves the coords for the group.
    updateCoords: function (coords) {
      this.groupCoords = coords;
    },

    // Saves the friends for the group in the array.
    updateFriends: function (friends) {
      this.groupFriends = friends;
    },

    sendInvitation: function () {
      let groupData = {};
      groupData.friends = this.groupFriends;
      groupData.image = this.groupImage;
      groupData.currentUser = sessionStorage.getItem('userId');
      groupData.groupId = sessionStorage.getItem('currentGroupId');

      this.socket.emit('addGroupRequests', groupData, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        $('.selected').hide();
        window.location.href = 'users.html';
      })
    },

    // Creates a new Group in the database and sends the requests to the invited friends.
    createNewGroup: function () {
      let that = this;
      let groupData = {};
      this.$btn.addClass('disabled');

      groupData.coords = this.groupCoords;
      groupData.title = $('.title-input').val();
      groupData.friends = this.groupFriends;
      groupData.image = this.groupImage;
      groupData.currentUser = sessionStorage.getItem('userId');
      groupData.time = $('#time_picker').val();
      groupData.date = `${$('#date_picker').val()} ${groupData.time}`;
      groupData.frequence = this.groupFrequence;

      // If validation goes right, the group is created.
      if (this.groupValidation(groupData)) {
        this.socket.emit('addGroup', groupData, (err, data) => {
          if (err)
            return navigator.notification.alert(
              err,
              (msg) => this.$btn.removeClass('disabled'),
              'Error'
            );

          groupData.groupId = data._id;
          that.socket.emit('addGroupRequests', groupData, (err, res) => {
            if (err)
              return navigator.notification.alert(
                err,
                (msg) => this.$btn.removeClass('disabled'),
                'Error'
              );

            window.location.href = 'main.html#/all'
          })
        });
      }

    },

    // Checks that all fields have been filled correctly.
    groupValidation: function (data) {
      if (data.coords === undefined) {
        this.snackBar('Tienes que elegir un lugar en el mapa');
        this.$btn.removeClass('disabled');
        return false;
      } else if (data.title.trim() === "") {
        this.snackBar('Tienes que añadir un título para el grupo');
        this.$btn.removeClass('disabled');
        return false;
      } else if (data.date.trim() === "" || data.time.trim() === "") {
        this.snackBar('Tienes que añadir fecha y hora del evento');
        this.$btn.removeClass('disabled');
        return false;
      } else if (data.friends.length === 0) {
        this.snackBar('Tienes que añadir por lo menos a 1 amigo');
        this.$btn.removeClass('disabled');
        return false;
      }

      return true
    },

    addGroupImage: function () {
      let that = this;
      let options = {
        'destinationType': 1,
        'sourceType': 0,
        'mediaType': 0,
        'correctOrientation': true,
        'quality': 25,
        'allowEdit': true
      };

      let addImage = navigator.camera.getPicture(function (image_URI) {
        that.getFileContentAsBase64(image_URI, (base64Image) => {
          that.groupImage = base64Image;
          $('.new-group-image-container').html(`<img src="${base64Image}">`);
          app.userCollection.fitImage($('.new-group-image img'));
        })

      }, function (err) {
      // Native alerts from phonegap
        navigator.notification.alert(
          err,
          (msg) => true,
          'Error'
        );
      }, options);

      document.addEventListener("deviceready", addImage, false);
    },

    getFileContentAsBase64: function (path,callback) {
        window.resolveLocalFileSystemURL(path, gotFile, fail);

        function fail(e) {
          navigator.notification.alert(
            err,
            (msg) => true,
            'Cannot find requested file'
          );
        };

        function gotFile(fileEntry) {
          fileEntry.file(function(file) {
            let reader = new FileReader();
            reader.onloadend = function(e) {
              let content = this.result;
              callback(content);
            };
            // The most important point, use the readAsDatURL Method from the file plugin
            reader.readAsDataURL(file);
          });
        }
    },

    // Toggles the animation of the search bar. You can pass a boolean in 'isState'
    // to go to the desired open/close state.
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

      // $('.glass-orange').toggleClass('scale-out', !isHasClass);
      // $('.glass-white').toggleClass('scale-out', isHasClass);
      // $('.search-input').toggleClass('scale-out', !isHasClass);
    },

    // Blurs the timePicker input to not show keyboard
    blurOut: function () {
      $('#time_picker').blur();
    },

    // Sets the frequence of the group
    addFrequence: function(e) {
      let el = $(e.target);

      // Checks which of the buttons have been clicked.
      if (el.hasClass('once-btn')) {
        this.groupFrequence = 'once';
        $('.datepicker').attr('disabled', false)
      } else if (el.hasClass('weekly-btn')) {
        this.groupFrequence = 'weekly';
        $('.datepicker').attr('disabled', false)
      } else if (el.hasClass('always-btn')) {
        this.groupFrequence = 'always';
        $('.datepicker').attr('disabled', true)
      }
    }
  })

  new app.FriendsView();
})
