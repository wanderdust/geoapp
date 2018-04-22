// View for a single user.

var app = app || {};

$(function () {

  app.UserView = Backbone.View.extend({
    tagName: 'li',

    template: Templates.userTemplateB,

    events: {
      "click .pending-icon": "showPendingStatus",
      "click .image": "openImageModal",
      "click .options-add-friend": "addFriend"
    },

    initialize: function () {
      _.bindAll(this, 'showOptions');
      this.listenTo(this.model, 'change', this.render);
      this.listenToOnce(this.model, 'updateOne', this.updateOne);
      this.listenToOnce(this.model, 'initModal', this.updateInstance);

      // Hammerjs press event
      let mc = this.$el.hammer({}).bind("press", this.showOptions);
      mc.data('hammer').get('press').set({time: 800});

      this.instance;

    },

    render: function () {
      let isOnline = (this.model.get('isOnline'));
      let isPending = (this.model.get('isPending'));
      let template = Handlebars.compile(this.template);
      let html = template(this.model.toJSON());


      this.$el.html(html);
      this.$el.toggleClass('online', isOnline);
      this.$el.toggleClass('pending', isPending);
      app.userCollection.fitImage(this.$('.image img'));

      return this;
    },

    updateInstance: function (instance) {
      this.instance = instance;
    },
    // The view gets removed and re-appended to be on the correct column.
    updateOne: function (model) {
      this.$el.remove();
      app.userCollection.trigger('add', model);
    },

    // toggles to show the pending status of the user instead of his status.
    showPendingStatus: function () {
      this.$('.group-status').toggleClass('hidden');
    },

    // shows the users image in a modal
    openImageModal: function () {
      let userImage = this.$('.image img').attr('src');
      app.userCollection.fitImage($('#modal1 img'));
      $('#modal1 img').attr('src', userImage);
      this.instance.open();
    },

    showOptions: function (e) {
      e.stopPropagation();
      this.$('.dropdown').removeClass('hidden');
    },

    addFriend: function (e) {
      e.stopPropagation();

      socket.emit('addFriend', {
        friendId: this.model.get('_id'),
        userId: sessionStorage.getItem('userId')
      }, (err, res) => {
        if (err) {
          app.userCollection.trigger('snackBar', err.Message);
          return
        }
        app.userCollection.trigger('snackBar', res.Message);
      });

      this.$('.dropdown').addClass('hidden');
    }
  })

})
