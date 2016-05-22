function Move(options) {
  this._el = $(options.el);
  this._bindEvents();
}

Move.prototype._bindEvents = function () {
  this._el.on('click', this._scrollWindow.bind(this));
}

Move.prototype._scrollWindow = function (e) {
  e.preventDefault();
  var block = $(e.target).attr('href');
  var top = $(block).offset().top;

  $("body, html").animate({scrollTop: top}, 400, "swing");
}
