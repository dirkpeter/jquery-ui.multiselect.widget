$(function () {
  var $body = $('body');

  $.widget('ui.multiselect', {
    // default options
    options: {
      // config
      hideSelect:         true,
      selectAll:          true,
      minItemFilter:      5,
      maxItems:           3,

      // text
      defaultButtonTitle: 'No value selected',
      displayTextSG:      '1 of ## value selected',
      displayTextPL:      '@@ of ## values selected',
      trivialSeperator:   ', ',

      // my precious... - don't touch that stuff
      namespace:          'ui-multiselect',
      button:             {
        $el:    undefined,
        $title: undefined
      },
      list:               {
        $wrap:    undefined,
        $el:      undefined,
        $options: undefined
      },
      options:            [],
      selected:           []
    },


    _create: function () {
      var self = this;

      // hide select
      if (self.options.hideSelect !== false) {
        $(self.element).hide();
      }

      // create markup
      self._createMarkup();
    },


    _init: function () {
      this._refresh();
    },


    _refresh: function () {
      var self = this;

      self._setListener();
      self._getValues();
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


    _getValues: function () {
      var self = this;
      return self.options.selected = self.element.val();
    },


    getSelectedOptions: function () {
      var opts = this.options,
        selected = opts.selected;

      if (selected) {
        return opts.options.filter(function (obj) {
          return ($.inArray(obj.value, selected) !== -1);
        });
      }

      return null;
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
      $wrap.insertAfter(self.element);//.hide();
    },


    _setListener: function () {
      var self = this;

      // just in case...
      self._unsetListener();

      $(self.element).on('change.ui-ms', function () {
        self._refresh();
      });
    },


    _unsetListener: function () {
      var self = this,
        options = self.options;

      $(self.element).off('change.ui-ms');
    },


    setTitle: function () {
      var self = this,
        opts = self.options,
        trivials = self.getSelectedOptions(),
        title = opts.defaultButtonTitle,
        len;

      if (trivials !== null) {
        len = trivials.length;
        if (len > opts.maxItems) {
          // singular / plural
          title = (len === 1)
            ? opts.displayTextSG
            : opts.displayTextPL.replace('@@', len);
          // and total
          title = title.replace('##', opts.options.length);
        }
        else {
          // join all trivials
          title = trivials.map(function (item) {
            return item.title;
          }).join(opts.trivialSeperator);
        }
      }

      self.options.button.$title.text(title);
    }
  });
});