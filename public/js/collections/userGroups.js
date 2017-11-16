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
    }
  })
  app.userGroupCollection = new UserGroupCollection();
  app.userGroupCollection.fetch();
})
