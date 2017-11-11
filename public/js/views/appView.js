var app = app || {};

$(function () {

  app.AppView = Backbone.View.extend({
    tagname: '#app-container',

    events: {

    },

    initialize: function () {
      this.$list = $('#group-list');
      app.groupCollection.fetch();

      this.listenTo(app.groupCollection, 'add', this.appendOne);

    },

    render: function () {

    },

    appendOne: function (group) {
      let view = new app.GroupView({model: group});
      this.$list.append(view.render().el)
    },

    appendAll: function () {
      this.$list.html('');
      app.groupCollection.each(this.appendOne, this)
    }
  })

})
