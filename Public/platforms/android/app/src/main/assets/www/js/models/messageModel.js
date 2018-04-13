// Model for a single message.

var app = app || {};

$(function () {

  app.MessageModel = Backbone.Model.extend({
    defaults: {
      from: '',
      body: '',
      timeStamp: 0,
      userId: ''
    },

    getFormattedTime: function () {
      this.set({timeStamp: moment(this.get('timeStamp')).locale('es').format('DD MMM h:mm a')})
    },

    getCurrentUserName: function (userId) {
      if (userId === this.get('userId')) {
        this.set({from: 'Yo'});
        return true;
      };
      return false;
    }
  })
})
