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

    //Creates a new userCollection for users in each group.
    groupUsers: async function (usersInGroup) {
      let newUserCollection = [];
      await app.userCollection.fetch();

      _.each(usersInGroup, function (user) {
        let model =_.find(app.userCollection.models, function (e) {
          return e.get('name') === user.get('userName')
        });

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
        let model =_.find(app.groupCollection.models, function (e) {
          return e.get('title') === group.get('groupName')
        });

        // Return an array of online users.
        let filterType = that.filteredByGroup(group.get('groupName'));
        let filterOnline = filterType.filter(function (e) {
          return e.get('online') === true;
        })
        let showOnline = filterOnline.map(function (e) {
            if (e.get('online')) {
              return e.get('userName')
            }
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
  app.userGroupCollection = new UserGroupCollection();
  app.userGroupCollection.fetch();
})
