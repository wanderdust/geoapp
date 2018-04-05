// View for a single my-friend.

var app = app || {};

$(function () {

  app.MyFriendView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.userTemplateC,

    events: {
      "click .image": "openImageModal"
    },

    initialize: function () {
      _.bindAll(this, 'updateInstance', 'openImageModal');

      this.listenTo(app.userCollection, 'initModal', this.updateInstance);

      this.instance;
    },

    render: function () {
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());

      this.$el.html(html);
      app.userCollection.fitImage(this.$('.image img'));
      return this;
    },

    updateInstance: function (instance) {
      this.instance = instance;
    },

    // shows the users image in a modal
    openImageModal: function () {
      let userImage = this.$('.image img').attr('src');
      app.userCollection.fitImage($('#modal1 img'));
      $('#modal1 img').attr('src', userImage);
      this.instance.open();
    }
  })

})
