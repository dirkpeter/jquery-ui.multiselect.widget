$(function () {
  var $body = $('body');

  $.widget('ui.multiselect', {
    // default options
    options: {
      // config
      hideSelect:          true,
      showCheckbox:        true,
      selectAll:           true,
      minItemFilter:       5,
      maxItems:            3,
      minWidth:            0, // auto

      // text
      defaultDisplayTitle: 'No value selected',
      displayTextSG:       '1 of ## value selected',
      displayTextPL:       '@@ of ## values selected',
      trivialSeperator:    ', ',

      // my precious... - don't touch that stuff
      namespace:           'ui-multiselect',
      isMultiple:          undefined,
      display:             {
        $el:    undefined,
        $title: undefined
      },
      wrap:                {
        $el: undefined
      },
      list:                {
        $wrap:    undefined,
        $el:      undefined,
        $options: undefined
      },
      options:             [],
      selected:            []
    },


    _create: function () {
      console.log('_create');
      var self = this,
        $el = self.element;

      // hide select
      if (self.options.hideSelect !== false) {
        $el.hide();
      }

      // check for multi- or single-select
      self.options.isMultiple = ($el.attr('multiple') !== undefined);

      // create markup ~ hey! ho! let's go! ~
      self._createMarkup();
    },


    _init: function () {
      console.log('_init');
      var self = this;

      self._setListener();
      self._refresh();
    },


    _refresh: function () {
      console.log('_refresh');
      var self = this;

      self._getValues();
      self.showSelected();
      self.setTitle();
    },


    _destroy: function () {
      console.log('_destroy');
      var self = this,
        options = self.options;

      // removing listener
      self._unsetListener();

      // removing markup
      options.display.$el.remove();
      options.list.$wrap.remove();

      // and show the select again
      $(self.element).show();
    },


    _createMarkup: function () {
      console.log('_createMarkup');
      var self = this;

      self._createDisplay();
      self._createList();
    },


    _createDisplay: function () {
      console.log('_createDisplay');
      var self = this,
        opts = self.options,
        namespace = opts.namespace,
        btn = opts.display;

      // title
      btn.$title = $('<span class="' + namespace + '--title"></span>');
      // fake-dropdown
      btn.$el = $('<button class="' + namespace + '--display"></button>')
        .css('min-width', opts.minWidth)
        // icon
        .html('<span class="' + namespace + '--icon"></span>')
        .prepend(btn.$title)
        // append
        .insertAfter(this.element);
    },


    _getOptions: function () {
      console.log('_getOptions');
      var data = [];

      // getting optionsdata from select
      $.each(this.element.find('option'), function (index, option) {
        var $option = $(option);
        data.push({
          title: $option.text(),
          value: $option.val(),
          class: $option.attr('class')
        });
      });

      return data;
    },


    _getValues: function () {
      console.log('_getValues');
      var self = this;
      return self.options.selected = self.element.val();
    },


    getSelectedOptions: function () {
      console.log('getSelectedOptions');
      var opts = this.options,
        selected = opts.selected;

      if (selected) {
        if (opts.isMultiple) {
          // multi
          return opts.options.filter(function (obj) {
            return ($.inArray(obj.value, selected) !== -1);
          });
        } else {
          // single
          return opts.options.filter(function (obj) {
            return (obj.value === String(selected));
          });
        }
      }

      return null;
    },


    _createList: function () {
      console.log('_createlist');
      var self = this,
        opts = self.options, // widget options
        options = undefined, // select options
        namespace = opts.namespace,
        list = opts.list,
        $wrap,
        $list;

      // getting all the data
      options = opts.options = self._getOptions(); // this might become confusing...

      // creating the markup
      $wrap = list.$wrap = $('<div class="' + namespace + '--list-wrap"></div>')
      $list = list.$el = $('<ul class="' + namespace + '--list"></ul>').appendTo($wrap);

      // create the list
      $.each(options, function (index, option) {
        var oClass = option.class,
          cl = (oClass) ? ' class="' + oClass + '"' : '',
          $li;

        $li = $('<li data-value="' + option.value + '"' + cl + '>' + option.title + '</li>').appendTo($list);

        // prepend checkboxes if multi-select
        if (opts.isMultiple && opts.showCheckbox) {
          $('<input type="checkbox" value="" />').prependTo($li);
        }

        options[index].$el = $li;
      });

      // min-width for wrap
      if (opts.minWidth !== 'auto') {
        $wrap.css('min-width', opts.minWidth);
      }

      // append the whole thing
      $wrap.appendTo('body');
    },


    _setListener: function () {
      console.log('_setListener');
      var self = this,
        opts = self.options;

      // original select change
      self.element.on('change.ui-ms', function () {
        console.log('change.ui-ms');
        self._refresh();
      });

      // artificial list item click
      opts.list.$el.on('click.ui-ms', 'li', function () {
        console.log('click.ui-ms', $(this).data('value'));
        self._toggleValue($(this).data('value'));
      });

      // prevent checkbox-click
      if (opts.isMultiple && opts.showCheckbox) {
        opts.list.$el.on('click.ui-ms', 'input', function (e) {
          e.preventDefault();
        });
      }

      // button click » toggle list
      opts.display.$el.on({
        focus: function () {
          self.open();
        },
        blur: function () {
          self.close();
        }
      });
    },


    _toggleValue: function (val) {
      console.log('_toggleValue', val);
      var self = this,
        $el = self.element;

      $el.find('[value="' + val + '"]').prop('selected', ($.inArray(String(val), self.options.selected) === -1));
      $el.trigger('change');
    },


    open: function () {
      console.log('open');
      var self = this,
        opts = self.options,
        $display = opts.display.$el,
        offset = $display.offset(),
        height = $display.outerHeight(),
        width = $display.outerWidth();

      // set position & min-width
      opts.list.$wrap
        .css({
          top: offset.top + height,
          left: offset.left,
          minWidth: (width > opts.minWidth) ? width : opts.minWidth
        })
        .show();
    },


    close: function () {
      console.log('close');
      this.options.list.$wrap.hide();
    },


    showSelected: function () {
      console.log('showSelected');
      var self = this,
        opts = self.options,
        selected = self.getSelectedOptions(),
        $sel = $(),
        selectedClass = opts.namespace + '--selected',
        $list = opts.list.$el.find('li');

      // remove previous settings
      $list.removeClass(selectedClass);
      if (opts.isMultiple && opts.showCheckbox) {
        $list.find(':checked').prop('checked', false);
      }

      // set selected class & checkbox prop
      if (selected) {
        // collect all elements
        for (var i = 0, len = selected.length; i < len; i++) {
          $sel = $sel.add(selected[i].$el);
        }

        // set selected
        $sel.addClass(selectedClass)
          .find('input').prop('checked', true);
      }
    },


    setTitle: function () {
      console.log('setTitle');
      var self = this,
        opts = self.options,
        trivials = self.getSelectedOptions(),
        title = opts.defaultDisplayTitle,
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

      self.options.display.$title.text(title);
    }
  });
});