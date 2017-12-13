// Collection of group models.

var app = app || {};

$(function () {

  let GroupCollection = Backbone.Collection.extend({
    model: app.GroupModel,

    url: './json/groupsDB.json',

    // Filters and Returns a collection instance with online users.
    online: function () {
      let filtered = this.filter(function (e) {
        return e.get("activeUsers").length > 0;
      })
      return new GroupCollection(filtered);
    },

    // Filters and returns a collection instance with pending users.
    pending: function () {
      let filteredOne = this.filter(function (e) {
        return e.get("pendingUsers").length > 0;
      })
      let filteredTwo = filteredOne.filter(function (e) {
        return e.get("activeUsers").length === 0;
      })
      return new GroupCollection(filteredTwo);
    },

    findAndUpdateOneOnline: function (data) {
      // Updates the activeUsers and pending arrays in the models.
      // First checks if user is online and deletes him from array.
      // Second checks if user is pending and deletes him from array.
      // Third if the first ones don't apply it means he is online, and adds him to array.

      // Checks if the user being updated is currentUser and changes userName for 'Me'
      if (data.userId === sessionStorage.getItem('userId'))
        data.userOnline = 'Yo'


      let model = this.findWhere({_id: data._id});
      let onlineUsersArray = model.get('activeUsers');
      let pendingUsersArray = model.get('pendingUsers');
      let onlineUserIndex = onlineUsersArray.indexOf(data.userOnline);
      let pendingUserIndex = pendingUsersArray.indexOf(data.userOnline);


      if (onlineUserIndex !== -1) {
        onlineUsersArray.splice(onlineUserIndex, 1);
        model.set({activeUsers: onlineUsersArray});
      } else if (pendingUserIndex !== -1) {
        pendingUsersArray.splice(pendingUserIndex, 1);
        model.set({pendingUsers: pendingUsersArray});
      } else {
        onlineUsersArray.push(data.userOnline);
        model.set({activeUsers: onlineUsersArray});
      }

      this.set({model}, {add: false, remove: false, merge: true});

      // Renders the changed model and the updates markers.
      model.trigger('render');
      // Updates the markers.
      this.trigger('updateMarkers')
    },

    findAndUpdateOnePending: function (data) {
      if (data.userId === sessionStorage.getItem('userId'))
        data.userName = 'Yo';

      let model = this.findWhere({_id: data._id});
      let pendingUsersArray = model.get('pendingUsers');
      let pendingUserIndex = pendingUsersArray.indexOf(data.userName);

      if (pendingUserIndex !== -1) {
        pendingUsersArray.splice(pendingUserIndex, 1);
        model.set({pendingUsers: pendingUsersArray});
      } else {
        pendingUsersArray.push(data.userName);
        model.set({pendingUsers: pendingUsersArray});
      }

      // Renders the changed model.
      model.trigger('render');
      // Updates the Markers.
      this.trigger('updateMarkers')
    }
  })

  app.groupCollection = new GroupCollection();
})
