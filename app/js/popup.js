function Popup(options) {
  this._el = $(options.el);
  this._bindEvents();
}

Popup.prototype._bindEvents = function () {
  this._el.on('click', this._openPopup.bind(this));
  $('.js-overlay, .js-close').on('click', this._closePopup.bind(this));
}

Popup.prototype._openPopup = function (e) {
  e.preventDefault();
  $('.popup').addClass('js-active');
}

Popup.prototype._closePopup = function () {
  $('.popup').removeClass('js-active');
}
