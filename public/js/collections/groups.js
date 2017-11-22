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
    }
  })

  app.groupCollection = new GroupCollection();
})
