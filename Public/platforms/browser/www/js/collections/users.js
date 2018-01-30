// Collection of user models.

var app = app || {};

$(function () {

  let UserCollection = Backbone.Collection.extend({
    model: app.UserModel,

    // filters and returns collection with online users.
    onlineUsers: function () {
      return this.where({isOnline: true});
    },

    // filters and returns collection with offline users.
    offlineUsers: function () {
      return this.where({isOnline: false});
    },

    // looks for online/pending users. If it finds one returns true.
    isStatus: function (filterType) {
      let model;

      if (filterType === 'online') {
        model = this.where({isOnline: true})
      } else {
        model = this.where({isPending: true})
      }
      return model.length > 0;
    },

    // Updates the user online/offline status.
    updateOnlineUser: function (userId, groupId) {
      let currentGroup = sessionStorage.getItem('currentGroupId');
      let model = this.findWhere({_id: userId});

      if (currentGroup === groupId) {
        model.set({isOnline: true});
        model.set({isPending: false})
      } else {
        model.set({isOnline: false})
      };

      // Saves the new model updates in the collection.
      this.set({model}, {add: false, remove: false, merge: true});
    },

    // Updates the user pending status.
    updatePendingUser: function (userId, groupId) {
      let currentGroup = sessionStorage.getItem('currentGroupId');
      let model = this.findWhere({_id: userId});

      if (currentGroup === groupId) {
        model.set({isPending: true})
      } else {
        model.set({isPending: false})
      };

      // Saves the new model updates in the collection.
      this.set({model}, {add: false, remove: false, merge: true});
    }
  })

  // New instance of the collection and we grab data with fetch.
  app.userCollection = new UserCollection();
})
