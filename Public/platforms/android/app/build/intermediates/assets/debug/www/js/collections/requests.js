// Collection of group models.

var app = app || {};

$(function () {

  let RequestCollection = Backbone.Collection.extend({
    model: app.RequestModel,

    fitImage: async function (view) {
      let i = new Image();

      i.onload = await function () {
        if (this.height > this.width)
          return view.addClass('fit-vertically');
        view.addClass('fit-horizontally');
      }
      i.src = view.attr('src');
      view.removeClass('hidden');
    }
  })

  app.requestCollection = new RequestCollection();
})
