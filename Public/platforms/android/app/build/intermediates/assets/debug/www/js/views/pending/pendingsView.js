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
      socket.emit('connectedClient', sessionStorage.getItem('userId'));

      this.listenTo(app.groupCollection, 'update', this.render);
      this.listenTo(app.groupCollection, 'showAlert', this.snackBar);

      this.loadCache();

      this.socket.emit('createGroupCollection', {userId}, (err, collection) => {
        if(err){
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );
        } else if (collection.length === 0) {
          app.groupCollection.trigger('addPlaceHolder')
        }

        // If localStorage doesnt exist we load from http request.
        if (localStorage.getItem('pendingGroupsCache_geoApp') === null) {
          app.groupCollection.add(collection);
        } else {
          app.groupCollection.reset(collection);
        }
        // Saves the gruoups in the localStorage.
        that.saveDataLocally(collection);

        that.socket.emit('findIfPending', {userId}, (err, status) => {
          if (err)
            return navigator.notification.alert(
              err,
              (msg) => true,
              'Error'
            );

          let model = app.groupCollection.findWhere({_id: status.groupId});
          model.trigger('updateSelected')
        })
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
      let cache = JSON.parse(localStorage.getItem('pendingGroupsCache_geoApp'));
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
      localStorage.setItem('pendingGroupsCache_geoApp', groupCollection);
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
