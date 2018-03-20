// View of all the myFriend views.

var app = app || {};
var socket = loadSocket();

$(function () {

  app.UserList = Backbone.View.extend({
    el: '.tabs-content',

    initialize: function () {
      _.bindAll(this, 'getContacts', 'onSuccessContact', 'updateFriends')
      this.socket = socket;
      this.$friendList = $('.groups-list ul');

      this.listenTo(app.userCollection, 'add', this.appendOne);
      this.listenTo(app.userCollection, 'search', this.search);

      // inits the modal
      this.modalElem = document.querySelector('.modal');
      this.modalInst = M.Modal.init(this.modalElem, {
        dismissible:true,
        preventScrolling: true
      });

      document.addEventListener("deviceready", this.getContacts, false);

      new app.MyFriendView();
    },

    render: function () {

    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {
      let view = new app.MyFriendView({model: user});
      this.$friendList.append(view.render().el);

      // initModal sends the modal intance to each model.
      app.userCollection.trigger('initModal', this.modalInst);
    },

    appendAll: function (collection) {
      this.$friendList.html('');
      collection.each(this.appendOne, this);
    },

    getContacts: function () {
      let options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      let fields = ["phoneNumbers"];
      let foo = navigator.contacts.find(fields, this.onSuccessContact, this.onErrorContact, options);
    },

    onSuccessContact: function (contacts) {
      // First return make an array with only phone numbers. We eliminate any
      // white spaces in between them.

      let phoneNumbers = contacts.map((contact) => {
        return contact.phoneNumbers[0].value.replace(/\s+/g, '');
      });

      // Second we filter the array to send only valid numbers.
      this.filterPhoneNumbers(phoneNumbers);
    },

    filterPhoneNumbers: function (phoneNumbers) {
      // Filter phones only with valid prefixes, and valid length.
      console.log(JSON.stringify(phoneNumbers));

      // Send data to server and get and add new users if there is any.
      this.updateFriends(phoneNumbers);
    },

    // Checks in the server if any user has a phone from the current user list.
    // if a phone is found the friend gets added.
    updateFriends: function (phoneNumbers) {
      let that = this;
      let data = {};
      data.userId = sessionStorage.getItem('userId');
      data.phoneNumbers = phoneNumbers;

      this.socket.emit('updateFriendsList', data, (err, res) => {
        if (err)
          console.log(err);

        console.log('hello')
      });
    },

    onErrorContact: function () {
      console.log(JSON.stringify(e))
    },

    // Shows/hides users when introducing a query.
    search: function() {
      let input, filter, ul, li, a, i;
      input = $('.friends-query');
      filter = input.val().toUpperCase();
      ul = $('.groups-list ul');
      li = ul.find('li');

      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < li.length; i++) {
          name = li[i].getElementsByClassName("group-title")[0].innerHTML.toUpperCase();
          if (name.indexOf(filter) > -1) {
              li[i].style.display = "";
          } else {
              li[i].style.display = "none";
          }
      }
    },
  })

})
