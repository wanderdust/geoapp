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
      this.listenTo(this.model, 'change', this.render)
    },

    render: function () {
      let isOnline = (this.model.get('activeUsers').length > 0 ? true : false);

      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$('.image-animation').toggleClass('online-group', isOnline)
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
