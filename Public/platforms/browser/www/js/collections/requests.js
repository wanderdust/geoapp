// Collection of group models.

var app = app || {};

$(function () {

  let RequestCollection = Backbone.Collection.extend({
    model: app.RequestModel,

    fitImage: async function (className) {
      let i = new Image();

      i.onload = await function () {
        if (this.height > this.width)
          return $(className).addClass('fit-vertically');
        $(className).addClass('fit-horizontally');
      }
      i.src = $(className).attr('src');
    }
  })

  app.requestCollection = new RequestCollection();
})
