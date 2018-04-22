// Collection of message models.

var app = app || {};

$(function () {

  let MessageCollection = Backbone.Collection.extend({
    model: app.MessageModel,

    fitImage: async function (view) {
      let i = new Image();

      i.onload = await function () {
        if (this.height > this.width)
          return view.addClass('fit-vertically');
        view.addClass('fit-horizontally');
      }
      i.src = view.attr('src');
      // The image shows already resized.
      view.removeClass('hidden');
    }
  })

  app.messageCollection = new MessageCollection();
})
