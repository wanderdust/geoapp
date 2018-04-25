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
      let timeStamp = moment(this.get('timeStamp')).format('d/M/Y');
      let today = moment().format('d/M/Y');
      let yesterday = moment().subtract(24, 'hours').format('d/M/Y');

      if (timeStamp === today) {
        this.set({timeStamp: `Hoy ${moment(this.get('timeStamp')).locale('es').format('h:mm a')}`});
      } else if (timeStamp === yesterday) {
        this.set({timeStamp: `Ayer ${moment(this.get('timeStamp')).locale('es').format('h:mm a')}`})
      } else {
        this.set({timeStamp: moment(this.get('timeStamp')).locale('es').format('DD MMM h:mm a')});
      }
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
