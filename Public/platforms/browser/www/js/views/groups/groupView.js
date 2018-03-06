// View of a single group model.

var app = app || {};
var socket = socket || io.connect('http://10.40.40.54:3000');

$(function () {

  app.GroupView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.groupTemplateA,

    events: {
      "click .group-container": "showUsers"
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'render', this.render);
      this.listenTo(this.model, 'visible', this.toggleVisible);
    },

    render: function () {
      let isOnline = (this.model.get('activeUsers').length > 0 ? true : false);
      let isPending = (this.model.get('activeUsers').length === 0 && this.model.get('pendingUsers').length > 0 ? true : false);
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      this.$el.toggleClass('pending', isPending);
      this.toggleVisible();
      app.groupCollection.fitImage('.image img', this.$('.image img'));
      return this;
    },

    toggleVisible: function () {
      this.$el.toggleClass('hidden', this.isHidden());
    },

    // FIltering algorithm.
    isHidden: function () {
      if (app.GroupFilter === "all") {
        return false;
      } else if (app.GroupFilter === "online") {
        if (this.model.get('activeUsers').length > 0) {
          return false
        }
        return true
      } else if (app.GroupFilter === "pending") {
        if (this.model.get('activeUsers').length === 0 && this.model.get('pendingUsers').length > 0) {
          return false
        }
        return true
      };
    },

    // Saves data in session storage and sends you to users.html.
    showUsers: function () {
      let groupId = this.model.get('_id');
      let groupName = this.model.get('title');
      sessionStorage.setItem('currentGroupName', groupName);
      sessionStorage.setItem('currentGroupId', groupId);
      window.location.href = 'users.html';
    }
  })

})
