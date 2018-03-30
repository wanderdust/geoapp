// View of all the request views.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.RequestList = Backbone.View.extend({
    el: '.tabs-content',

    template: Templates.contentPlaceholder,

    initialize: function () {
      this.socket = socket;
      this.$requestList = $('.invitations-list ul')

      this.listenTo(app.requestCollection, 'add', this.appendOne);
      this.listenTo(app.requestCollection, 'add remove addPlaceHolder', this.render);
      this.listenTo(app.requestCollection, 'addGroup', this.addUserToGroup);
      this.listenTo(app.requestCollection, 'rejectGroup', this.removeGroup);

      this.socket.on('addNewRequest', (data) => {
        app.requestCollection.add(data);
      });
    },

    render: function () {
      let content = $('.invitations-list ul').html();
      // Placeholder.
      if (content === "") {
        let template = Handlebars.compile(this.template);
        let html = template({placeholder: 'No tienes invitaciones a grupos'});

        this.$el.append(html);
        return this;
      } else {
        $('.empty-list-placeholder').remove();
      }
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (request) {
      let view = new app.RequestView({model: request});
      this.$requestList.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$requestList.html('');
      collection.each(this.appendOne, this);
    },

    addUserToGroup: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('joinGroup', requestId, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res)
      })
    },

    removeGroup: function (model) {
      let requestId = model.get('_id');

      this.socket.emit('rejectGroup', requestId, (err, res) => {
        if (err)
          return navigator.notification.alert(
            err,
            (msg) => true,
            'Error'
          );

        // Remove the model and update the view.
        app.requestCollection.remove(model);
        app.requestCollection.trigger('showAlert', res);
      })
    }
  })

})
