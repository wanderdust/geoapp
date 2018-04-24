// View of the whole pending app.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.PendingsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.listCount,

    events: {
      "click #back-arrow-container": "backToMain",
      "click .delete": "cancelPending"
    },

    initialize: function () {
      let that = this;
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;
      this.$groupsLength = $('.groups-length');

      new app.PendingList();

      // When client connects sends user data to keep track of user.
      socket.emit('connectedClient', {
        id: sessionStorage.getItem('userId'),
        token: sessionStorage.getItem('token')
      }, (err, res) => {
        if (err) {
          if (err.Error === 401)
            return window.location.href = 'index.html'
          return
        }
        return
      });

      this.listenTo(app.groupCollection, 'update', this.render);
      this.listenTo(app.groupCollection, 'showAlert', this.snackBar);

      this.loadCache();

      this.socket.emit('createGroupCollection', {
        userId,
        token: sessionStorage.getItem('token')
      }, (err, collection) => {
        if (err) {
          if (err.Error === 401)
            return window.location.href = 'index.html'
          return
        } else if (collection.length === 0) {
          app.groupCollection.trigger('addPlaceHolder')
        }

        // If localStorage doesnt exist we load from http request.
        if (localStorage.getItem('groupsCache_geoApp') === null) {
          app.groupCollection.add(collection);
        } else {
          app.groupCollection.reset(collection);
        }
        // // Saves the gruoups in the localStorage.
        // that.saveDataLocally(collection);

        that.socket.emit('findIfPending', {userId}, (err, data) => {
          if (err)
            return navigator.notification.alert(
              err,
              (msg) => true,
              'Error'
            );

            data.forEach((e) => {
              let model = app.groupCollection.findWhere({_id: e.groupId});
              model.trigger('updateSelected')
            })
        });
      })
      this.render();
    },

    render: function () {
      let count = app.groupCollection.length;

      let template = Handlebars.compile(this.template);
      this.$groupsLength.html(template({title:'Grupos' , count}));
    },

    // Loads the data from the localStorage.
    loadCache: function () {
      let cache = JSON.parse(localStorage.getItem('groupsCache_geoApp'));
      app.groupCollection.add(cache);
    },

    backToMain: function () {
      window.location.href = 'main.html#/online';
    },

    snackBar: function (message) {
      let x = this.$("#snackbar");
      x.html(message);
      x.addClass('show');
      setTimeout(function(){ x.removeClass('show'); }, 3000);
    }
  })

  new app.PendingsView();
})
