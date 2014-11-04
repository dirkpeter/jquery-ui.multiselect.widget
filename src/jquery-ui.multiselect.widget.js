$(function () {
  var $body = $('body');

  $.widget('ui.multiselect', {
    // default options
    options: {
      namespace: 'ui-multiselect',
      button: {
        $el: undefined,
        $title: undefined
      },
      list: {
        $wrap: undefined,
        $el: undefined,
        $options: undefined
      },
      options: [],
      selected: []
    },


    _create: function () {
      var self = this;

      // hide select
      // $(self.element).hide();

      // create markup
      self._createMarkup();
    },


    _init: function () {
      this._refresh();
    },


    _refresh: function () {
      var self = this;

      self._setListener();
      self.setTitle();
    },


    _destroy: function () {
      var self = this,
        options = self.options;

      // removing listener
      self._unsetListener();

      // removing markup
      options.button.$el.remove();
      options.list.$wrap.remove();

      // and show the select again
      $(self.element).show();
    },


    _createMarkup: function () {
      var self = this;

      self._createButton();
      self._createlist();
    },


    _createButton: function () {
      var self = this,
        options = self.options,
        namespace = options.namespace,
        btn = options.button;

      // title
      btn.$title = $('<span class="' + namespace + '--title"></span>');
      // fake-dropdown
      btn.$el = $('<button class="' + namespace + '--button"></button>')
        // icon
        .html('<span class="' + namespace + '--icon"></span>')
        .prepend(btn.$title)
        // append
        .insertAfter(this.element);
    },


    _getOptions: function () {
      var data = [];

      // getting optionsdata from select
      $.each(this.element.find('option'), function (index, option) {
        var $option = $(option);
        data.push({
          title: $option.text(),
          value: $option.val()
        });
      });

      return data;
    },


    _createlist: function () {
      var self = this,
        options = self.options,
        opts = undefined,
        namespace = options.namespace,
        list = options.list,
        $wrap = list.$wrap,
        $list = list.$el;

      // getting all the data
      opts = options.options = self._getOptions(); // this might become confusing...

      // creating the markup
      $wrap = $('<div class="' + namespace + '--wrap"></div>');
      $list = $('<ul class="' + namespace + '--list"></ul>').appendTo($wrap);

      // create the list
      $.each(opts, function (index, option) {
        opts[index].$el = $('<li data-value="' + option.value + '">' + option.title + '</li>').appendTo($list);
      });

      // append the whole thing
      $list.appendTo($body).hide();

      console.log(this.options.options);
    },


    _setListener: function () {
      var self = this,
        options = self.options;

      // just in case...
      self._unsetListener();

      $(self.element).on('change.ui-ms', function () {
        console.log($(this).val());
        self._refresh();
      });
    },


    _unsetListener: function () {
      var self = this,
        options = self.options;

      $(self.element).unset('change.ui-ms');
    },

    setTitle: function () {
      this.options.button.$title.text('imabutton');
    }
  });
});