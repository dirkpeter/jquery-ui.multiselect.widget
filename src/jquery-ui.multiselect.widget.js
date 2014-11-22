(function ($) {
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
      isOpen:              false,
      event:               {
        last: undefined
      },
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
      var self = this;

      self._setListener();
      self._refresh();

      self._trigger('complete', null, {});
    },


    _refresh: function () {
      var self = this;

      self._getValues();
      self.showSelected();
      self.setTitle();

      self._trigger('refresh');
    },


    update: function () {
      var self = this;

      self.options.options = self._getOptions();
      self._createListContent();
      self._refresh();

      self._trigger('update');
    },


    _destroy: function () {
      var self = this,
        options = self.options;

      // removing listener
      self._unsetListener();

      // removing markup
      options.display.$el.remove();
      options.list.$wrap.remove();

      // and show the select again
      self.element.show();
    },


    _createMarkup: function () {
      var self = this;

      self._createDisplay();
      self._createList();
    },


    _createDisplay: function () {
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
      var data = [];

      // getting optionsdata from select
      $.each(this.element.find('option'), function (index, option) {
        var $option = $(option);
        data.push({
          disabled: $option.is(':disabled'),
          title:    $option.text(),
          value:    $option.val(),
          class:    $option.attr('class')
        });
      });

      return data;
    },


    _getValues: function () {
      var self = this,
        val = self.element.val();

      self.options.selected = val;

      return val;
    },


    getSelectedOptions: function () {
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
      var self = this,
        opts = self.options, // widget options
        namespace = opts.namespace,
        list = opts.list,
        $wrap;

      // getting all the data
      opts.options = self._getOptions(); // this might become confusing...

      // creating the markup
      $wrap = list.$wrap = $('<div class="' + namespace + '--list-wrap"></div>');
      list.$el = $('<ul class="' + namespace + '--list"></ul>').appendTo($wrap);

      // create the list
      self._createListContent();

      // min-width for wrap
      if (opts.minWidth !== 'auto') {
        $wrap.css('min-width', opts.minWidth);
      }

      // append the whole thing
      $wrap.appendTo('body');
    },


    _createListContent: function () {
      var self = this,
        opts = self.options, // widget options
        options = opts.options,
        $list = opts.list.$el;

      $list.empty();

      // create the list
      $.each(options, function (index, option) {
        var oClass = option.class,
          $li;

        $li = $('<li>' + option.title + '</li>')
          .data({
            value: option.value,
            disabled: option.disabled
          })
          .appendTo($list);

        if (oClass) {
          $li.addClass(oClass);
        }

        // prepend checkboxes if multi-select
        if (opts.isMultiple && opts.showCheckbox) {
          $('<input type="checkbox" value="" />').prependTo($li);
        }

        if (option.disabled) {
          self.setItemDiabledProp($li, true);
        }

        options[index].$el = $li;
      });
    },


    setItemDiabledProp: function ($item, disabled) {
      var self = this,
        disClass = self.options.namespace + '--disabled';
      
      if (disabled === undefined) {
        disabled = !$item.data('disabled');
      }

      if (disabled) {
        $item.addClass(disClass);
      } else {
        $item.removeClass(disClass);
      }

      $item.data('disabled', disabled)
        .find('[type="checkbox"]').prop('disabled', disabled);
    },


    _setListener: function () {
      var self = this;

      self._setSelectListener();
      self._setDisplayListener();
      self._setListListener();
    },


    _setSelectListener: function () {
      var self = this;

      // original select change
      self.element.on({
        change: function (e) {
          self._refresh();
          self._trigger('change', e, {});
        },
        // dom manipulation
        DOMSubtreeModified: function() {
          self.update();
        }
      });
    },


    _setListListener: function () {
      var self = this,
        opts = self.options,
        ev = opts.event;

      // artificial list item click
      opts.list.$el.on('mousedown.ui-ms', 'li', function (e) {
        var $el = $(this),
          value = $el.data('value'),
          disabled = $el.data('disabled');

        if (disabled) {
          opts.display.$el.focus(); // reset focus
          return false;
        }

        self._toggleValue(value);

        if (opts.isMultiple === false) {
          self.close();
        } else {
          ev.last = 'multiselect';
        }

        self._trigger('select', e, value);
      });

      // prevent checkbox-click
      if (opts.isMultiple && opts.showCheckbox) {
        opts.list.$el.one('click.ui-ms', 'input', function (e) {
          e.preventDefault();
        });
      }
    },


    _setDisplayListener: function () {
      var self = this,
        opts = self.options,
        ev = opts.event;

      // button click » toggle list
      opts.display.$el.on({
        click: function () {
          if (ev.last !== 'focus') {
            self.toggle();
          }
          ev.last = 'click';
        },
        focus: function () {
          self.open();
          ev.last = 'focus';
        },
        blur:  function () {
          if (ev.last === 'multiselect') {
            opts.display.$el.focus(); // reset focus
          } else {
            self.close();
            ev.last = 'blur';
          }
        }
      });
    },


    _toggleValue: function (val) {
      var self = this,
        opts = self.options,
        $el = self.element;

      if (opts.isMultiple) {
        $el.find('[value="' + val + '"]').prop('selected', ($.inArray(String(val), opts.selected) === -1));
      } else {
        $el.find('[value="' + val + '"]').prop('selected', true);
      }

      $el.trigger('change');
    },


    toggle: function () {
      var self = this,
        opts = self.options;

      if (opts.isOpen === false) {
        self.open();
      } else {
        self.close();
      }
    },


    open: function () {
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
          left:     offset.left,
          minWidth: (width > opts.minWidth) ? width : opts.minWidth
        })
        .show()
        .addClass(opts.namespace + '--open');
      opts.isOpen = true;

      self._trigger('open', null, {});
    },


    close: function () {
      var self = this,
        opts = self.options;

      opts.list.$wrap.hide()
        .removeClass(opts.namespace + '--open');
      opts.isOpen = false;

      self._trigger('close', null, {});
    },


    showSelected: function () {
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


    getTrivialValue: function () {
      var self = this,
        opts = self.options,
        trivials = self.getSelectedOptions(),
        title = opts.defaultDisplayTitle,
        len;

      if (trivials !== null) {
        len = trivials.length;

        if (opts.maxItems !== -1 && len > opts.maxItems) {
          // singular / plural
          title = (len === 1) ? opts.displayTextSG : opts.displayTextPL.replace('@@', len);
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

      return title;
    },


    setTitle: function () {
      var self = this;
      self.options.display.$title.text(self.getTrivialValue());
    }
  });
})(jQuery);