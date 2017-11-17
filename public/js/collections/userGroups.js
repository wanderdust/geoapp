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
    groupUsers: function (usersInGroup) {
      let newUserCollection = [];
      app.userCollection.fetch()
        .done(function () {
          _.each(usersInGroup, function (user) {
            let model =_.find(app.userCollection.models, function (e) {
              return e.get('name') === user.get('userName')
            })

            if (user.get('online')) {
              model.set({isOnline: true})
            }

            newUserCollection.push(model)
          })
          app.userCollection.reset(newUserCollection);
        })
    },

    userGroups: function (belongingGroups) {
      let that = this;
      let newGroupCollection = [];
      app.groupCollection.fetch()
        .done(function () {
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
            model.set({activeUsers: showOnline});

            // If there are no online users in the group,
            //checks if anyone has a pending status, and
            //it is notified to the model.
            if (group.get('pending') && showOnline.length === 0) {
              model.set({pending: true})
            }

            newGroupCollection.push(model);
          });
          app.groupCollection.reset(newGroupCollection);
        })
    }
  })
  app.userGroupCollection = new UserGroupCollection();
  app.userGroupCollection.fetch();
})
