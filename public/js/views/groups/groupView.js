// View of a single group model.

var app = app || {};

$(function () {

  app.GroupView = Backbone.View.extend({
    tagname: 'li',

    template: $('#group-template').html(),

    events: {
      "click .group-container": "showUsers"
    },

    initialize: function () {

    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      return this;
    },

    // Saves data in session storage and sends you to users.html.
    showUsers: function () {
      let groupId = this.model.get('_id');
      let groupName = this.model.get('title');
      sessionStorage.setItem('currentGroupName', groupName);
      sessionStorage.setItem('currentGroupId', groupId);
      window.location.href = '/users.html';
    }
  })

})
