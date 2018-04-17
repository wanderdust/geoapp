// View of a single group model.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.GroupView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.groupTemplateB,

    events: {
      "click .group-data-container": "showUsers",
      "click .image": "openImageModal",
    },

    initialize: function () {
      this.listenToOnce(this.model, 'change', this.updateOne);
      // this.listenTo(this.model, 'visible', this.toggleVisible);
      this.listenToOnce(this.model, 'initModal', this.updateInstance);
      this.instance;
    },

    render: function () {
      let isOnline = (this.model.get('activeUsers').length > 0 ? true : false);
      let isPending = (this.model.get('activeUsers').length === 0 && this.model.get('pendingUsers').length > 0 ? true : false);
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      this.$el.toggleClass('pending', isPending);

      app.groupCollection.fitImage(this.$('.image img'));
      return this;
    },

    updateOne: function (model) {
      this.$el.remove();
      app.groupCollection.trigger('add', model);
    },

    toggleVisible: function () {
      this.$el.toggleClass('hidden', this.isHidden());
    },

    // Saves data in session storage and sends you to users.html.
    showUsers: function () {
      let groupId = this.model.get('_id');
      let groupName = this.model.get('title');
      sessionStorage.setItem('currentGroupName', groupName);
      sessionStorage.setItem('currentGroupId', groupId);
      window.location.href = 'users.html';
    },

    updateInstance: function (instance) {
      this.instance = instance;
    },

    // shows the group's image in a modal
    openImageModal: function () {
      let groupImage = this.$('.image img').attr('src');
      app.userCollection.fitImage($('#modal1 img'));
      $('#modal1 img').attr('src', groupImage);
      this.instance.open();
    }
  })

})
