// View of the whole pending app.

var app = app || {};
var socket = socket || io.connect('http://127.0.0.1:3000');

$(function () {

  app.PendingsView = Backbone.View.extend({
    el: '#app-container',

    template: Templates.listCount,

    events: {
      "click #back-arrow-container": "backToMain"
    },

    initialize: function () {
      let that = this;
      let userId = sessionStorage.getItem('userId');
      this.socket = socket;
      this.$groupsLength = $('.groups-length');

      new app.PendingList();
      this.listenTo(app.groupCollection, 'update', this.render);
      this.listenTo(app.groupCollection, 'showAlert', this.snackBar);

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

        app.groupCollection.add(collection);
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
