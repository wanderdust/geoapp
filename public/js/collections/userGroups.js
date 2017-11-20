// Collection for the relationships between users and groups.
// Modify everything to search by id

var app = app || {};

$(function () {

  let UserGroupCollection = Backbone.Collection.extend({
    model: app.UserGroupModel,

    url: './json/userGroupDB.json',

    filteredByUser: function (nameId) {
      return this.where({userName: nameId});
    },

    filteredByGroup: function (nameId) {
      return this.where({groupName: nameId});
    },

    // Do it by ID's.
    findModel: function (collection, userGroupModel, userGroupKey, collectionKey) {
      return _.find(collection.models, function (e) {
        return e.get(userGroupKey) === userGroupModel.get(collectionKey);
      });
    },

    //Creates a new userCollection for users in each group.
    groupUsers: async function (usersInGroup) {
      let that = this;
      let newUserCollection = [];
      await app.userCollection.fetch();

      _.each(usersInGroup, function (user) {
        let model = that.findModel(app.userCollection ,user, 'name', 'userName');

        //sets the status of the user;
        if (user.get('online')) {
          model.set({isOnline: true})
        } else if (user.get('pending')) {
          model.set({pending: true})
        }

        newUserCollection.push(model)
      })
      app.userCollection.reset(newUserCollection);
    },
    // Creates a new groupCollection for the groups the user has.
    userGroups: async function (belongingGroups) {
      let that = this;
      let newGroupCollection = [];
      await app.groupCollection.fetch();

      _.each(belongingGroups, function (group) {
        let model = that.findModel(app.groupCollection, group, 'title', 'groupName');

        // returns an array of users models that belong to a group.
        let filterType = that.filteredByGroup(group.get('groupName'));
        // returns an array of only the users models that are online.
        let filterOnline = filterType.filter(function (e) {
          return e.get('online');
        });
        // Return an array of online users.
        let showOnline = filterOnline.map(function (e) {
            return e.get('userName')
        });

        // Sets the status of the group pending if no online users.
        if (group.get('pending') && !showOnline.length) {
          model.set({pending:  `${group.get('userName')} va a ir.`})
        }
        model.set({activeUsers: showOnline});
        newGroupCollection.push(model);
      });
      app.groupCollection.reset(newGroupCollection);
    }
  })

  // app.userGroupCollection = new UserGroupCollection();
  // app.userGroupCollection.fetch();
})
