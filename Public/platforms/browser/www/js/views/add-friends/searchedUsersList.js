// View of all the friends views.

var app = app || {};

$(function () {

  app.SearchedUsersList = Backbone.View.extend({
    el: '.tabs-content',

    template: Templates.contentPlaceholder,

    initialize: function () {
        this.listenTo(app.userCollection, 'add', this.appendOne);
        this.listenTo(app.userCollection, 'add addPlaceHolder', this.render);
        this.$list = $('.groups-list ul');

      //   document.addEventListener("deviceready", function onDeviceReady() {
      //     var options      = new ContactFindOptions();
      //     options.filter   = "";
      //     options.multiple = true;
      //     var fields = ["phoneNumbers"];
      //     let foo = navigator.contacts.find(fields, onSuccessContact, onErrorContact, options);
      //   }, false);
      //
      // function onSuccessContact (e) {
      //   console.log('First', JSON.stringify(e[2].phoneNumbers));
      //   // console.log(JSON.stringify(e))
      // }
      //
      // function onErrorContact (e) {
      //   console.log(JSON.stringify(e))
      // }

    },

    render: function () {
      let content = $('.groups-list ul');
      let trimmedContent = content.html().trim();
      // Placeholder.
      if (trimmedContent === "") {
        let template = Handlebars.compile(this.template);
        let html = template({placeholder: 'No se han encontrado usuarios'});

        $('.groups-list ul').html(html);
        return this;
      } else {
        $('.empty-list-placeholder').remove();
      }
    },

    // Appends a model every time there is an 'add' event.
    appendOne: function (user) {
      let view = new app.SearchedUserView({model: user});
      this.$list.append(view.render().el);
    },

    appendAll: function (collection) {
      this.$list.html('');
      collection.each(this.appendOne, this);
    }
  })

})
