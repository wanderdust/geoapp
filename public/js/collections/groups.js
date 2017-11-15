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
      let filtered = this.filter(function (e) {
        return e.get("pending") === true;
      })

      return new GroupCollection(filtered);
    },

    // Returns boolean of the online status of the current group.
    //Do it by _id.
    isOnline: function (name) {
      let model =  this.find(function (e) {
        return e.get('title') == name;
      })
      let isOnline = model.get('activeUsers').length > 0;
      let pending = model.get('pending');

      return {isOnline, pending}
    }
  })

  app.groupCollection = new GroupCollection();
  app.groupCollection.fetch();
})
