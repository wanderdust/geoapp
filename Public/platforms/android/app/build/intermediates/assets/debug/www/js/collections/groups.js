// Collection of group models.

var app = app || {};

$(function () {

  let GroupCollection = Backbone.Collection.extend({
    model: app.GroupModel,

    // Filters and Returns a collection instance with online users.
    online: function () {
      let filtered = this.filter(function (e) {
        return e.get("activeUsers").length > 0;
      });
      return new GroupCollection(filtered);
    },

    // Filters and returns a collection instance with pending users.
    pending: function () {
      let filteredOne = this.filter(function (e) {
        return e.get("pendingUsers").length > 0;
      });
      let filteredTwo = filteredOne.filter(function (e) {
        return e.get("activeUsers").length === 0;
      });
      return new GroupCollection(filteredTwo);
    },

    // returns a collection of offline users
    offline: function () {
      let filtered = this.filter(function (e) {
        return e.get("activeUsers").length === 0 && e.get("pendingUsers").length === 0
      });

      return new GroupCollection(filtered);
    },

    // Finds the group id for a group where the current user is online.
    findGroupId: function () {
      let userId = sessionStorage.getItem('userId');
      let onlineGroups = this.online();
      let onlineGroup = onlineGroups.filter((data) => {
        return data.get('activeUsers').indexOf('Yo') !== -1
      });
      let groupId;
      if (onlineGroup.length === 0)
        return groupId = false;

      groupId = onlineGroup[0].get('_id');
      return groupId;
    },

    findAndUpdateOneOnline: function (data) {
      // Updates the activeUsers and pending arrays in the models.
      // First checks if user is online and deletes him from array.
      // Second checks if user is pending and deletes him from array.
      // Third if the first ones don't apply it means he is online, and adds him to array.

      // Checks if the user being updated is currentUser and changes userName for 'Me'
      if (data.userId === sessionStorage.getItem('userId'))
        data.userOnline = 'Yo';

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

      // Saves the new model updates in the collection.
      this.set({model}, {add: false, remove: false, merge: true});

      // Renders the changed model and the updates markers.
      model.trigger('change', model);
      // Updates the markers.
      this.trigger('updateMarkers');
    },

    // Same as findAndUpdateOnline but also checks users location
    // as the user turn on the app.
    userOffline: function (data) {
      if (data.userId === sessionStorage.getItem('userId'))
        data.userOnline = 'Yo';

      let model = this.findWhere({_id: data._id});
      let onlineUsersArray = model.get('activeUsers');
      let onlineUserIndex = onlineUsersArray.indexOf(data.userOnline);

      // If he wasnt online in the first place, nothing gets changed.
      if (onlineUserIndex !== -1) {
        onlineUsersArray.splice(onlineUserIndex, 1);
        model.set({activeUsers: onlineUsersArray});
      }

      // Saves the new model updates in the collection.
      this.set({model}, {add: false, remove: false, merge: true});

      // Renders the changed model and the updates markers.
      model.trigger('render');
      model.trigger('change', model);
      // Updates the markers.
      this.trigger('updateMarkers');
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

      this.set({model}, {add: false, remove: false, merge: true});

      // Renders the changed model.
      model.trigger('change', model);
      // Updates the Markers.
      this.trigger('updateMarkers');
    },

    // Updates the groups array if a user has changed it.
    // Replaces the old name with the new one.
    findAndUpdateGroups: function (data) {
      if (data.userId === sessionStorage.getItem('userId'))
        data.userOnline = 'Yo';

      let model = this.findWhere({_id: data._id});
      let onlineUsersArray = model.get('activeUsers');
      let pendingUsersArray = model.get('pendingUsers');
      let onlineUserIndex = onlineUsersArray.indexOf(data.oldUserName);
      let pendingUserIndex = pendingUsersArray.indexOf(data.oldUserName);

      if (onlineUserIndex !== -1) {
        onlineUsersArray.splice(onlineUserIndex, 1, data.userOnline);
        model.set({activeUsers: onlineUsersArray});
      } else if (pendingUserIndex !== -1) {
        pendingUsersArray.splice(pendingUserIndex, 1, data.userOnline);
        model.set({pendingUsers: pendingUsersArray});
      }

      // Saves the new model updates in the collection.
      this.set({model}, {add: false, remove: false, merge: true});

      // Renders the changed model and the updates markers.
      model.trigger('change', model);
    },

    fitImage: async function (view) {
      let i = new Image();

      i.onload = await function () {
        if (this.height > this.width)
          return view.addClass('fit-vertically');
        view.addClass('fit-horizontally');
      }
      i.src = view.attr('src');
    }
  })

  app.groupCollection = new GroupCollection();
})
