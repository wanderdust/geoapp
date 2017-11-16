// View of all the user views.

var app = app || {};

$(function () {

  app.UserList = Backbone.View.extend({
    el: '.tabs-content',

    template: $('#user-template').html(),

    initialize: function () {
        this.$onlineUsers = $('.online-users-list ul');
        this.$offlineUsers = $('.offline-users-list ul');

        this.listenTo(app.userCollection, 'reset', this.appendAll);
        //Listens for changes in the groupCollection and updates userCollection.
        this.listenTo(app.userGroupCollection, 'all', _.debounce(this.render, 0));
    },

    render: function () {
      this.groupUsers();
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {
      let view = new app.UserView({model: user});

      if(user.get('isOnline')) {
        this.$onlineUsers.append(view.render().el);
      } else {
        this.$offlineUsers.append(view.render().el)
      }
    },

    appendAll: function (collection) {

      this.$onlineUsers.html('');
      this.$offlineUsers.html('');
      collection.each(this.appendOne, this);
    },

    groupUsers: function () {
      let groupName = sessionStorage.getItem('currentGroup')
      let usersInGroup = app.userGroupCollection.filteredByGroup(groupName);

      app.userGroupCollection.groupUsers(usersInGroup);
    }
  })

})
