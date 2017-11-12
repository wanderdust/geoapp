var app = app || {};

$(function () {

  let GroupCollection = Backbone.Collection.extend({
    model: app.GroupModel,

    url: 'groupsDB.json',

    online: function () {
      let filtered = this.filter(function (e) {
        return e.get("activeUsers").length > 0;
      })
      return new GroupCollection(filtered);
    },

    pending: function () {
      let filtered = this.filter(function (e) {
        return e.get("pending") === true;
      })

      return new GroupCollection(filtered);
    }
  })

  app.groupCollection = new GroupCollection();
})
