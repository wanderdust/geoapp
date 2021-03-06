// View of all the user views.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.UserList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      this.socket = socket;
      this.$onlineUsers = $('.online-users-list ul');
      this.$offlineUsers = $('.offline-users-list ul');

      this.listenTo(app.userCollection, 'add', this.appendOne);
      this.listenTo(app.userCollection, 'reset', this.appendAll);
      this.listenTo(app.userCollection, 'change', this.filterOne);

      // inits the modal
      this.modalElem = document.querySelector('.modal');
      this.modalInst = M.Modal.init(this.modalElem, {
        dismissible:true,
        preventScrolling: true
      });
    },

    render: function () {

    },

    filterOne: function (model) {
      model.trigger('updateOne', model);
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {

      let view = new app.UserView({model: user});

      if(user.get('isOnline')) {
        this.$onlineUsers.append(view.render().el);
      } else {
        this.$offlineUsers.append(view.render().el)
      }

      // initModal sends the modal intance to each model.
      user.trigger('initModal', this.modalInst);
    },

    appendAll: function (collection) {
      this.$onlineUsers.html('');
      this.$offlineUsers.html('');
      collection.each(this.appendOne, this);
    }
  })

})
