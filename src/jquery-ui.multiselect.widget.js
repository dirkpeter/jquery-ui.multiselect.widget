(function ($) {
  $.widget('ui.multiselect', {
    // default options
    options: {
      // config
      hideSelect:          true,
      showCheckbox:        true,
      bulkActions:         true,
      minItemFilter:       5,
      maxItems:            3,
      minWidth:            0, // auto

      // text
      defaultDisplayTitle: 'No value selected',
      displayTextSG:       '1 of ## value selected',
      displayTextPL:       '@@ of ## values selected',
      trivialSeperator:    ', ',
      resetButtonText:     'Filter reset',
      filterLabelText:     'Filter',
      bulkAllText:         'Select all',
      bulkNoneText:        'De-Select all',

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
      filter:              {
        $el:    undefined,
        $input: undefined,
        $reset: undefined
      },
      bulk:                {
        $el:     undefined,
        $all:    undefined,
        $none:   undefined,
        enabled: false
      },
      options:             {
        data:   [],
        length: 0
      },
      selected:            []
    },


    _create: function () {
      var self = this,
        $el = self.element,
        opts = self.options;

      // hide select
      if (opts.hideSelect !== false) {
        $el.hide();
      }

      // check for multi- or single-select
      self.options.isMultiple = ($el.attr('multiple') !== undefined);

      // add id-class
      $el.addClass(opts.namespace);

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
      self._updateFilterDisplay();

      self._trigger('refresh');
    },


    update: function () {
      var self = this;

      self._createListContent();
      self._refresh();

      self._trigger('update');
    },


    _destroy: function () {
      var self = this,
        opts = self.options;

      // removing markup
      opts.display.$el.remove();
      opts.list.$wrap.remove();
      self.element.removeClass(opts.namespace);

      // and show the select again
      self.element.show();
    },


    _createMarkup: function () {
      var self = this;

      self._createDisplay();
      self._createList();
      self._createFilterMarkup();
      if (self.options.bulkActions === true) {
        self._createBulkMarkup();
      }
    },


    _createFilterMarkup: function () {
      var self = this,
        opts = self.options,
        filter = opts.filter,
        $el;

      $el = filter.$el = $('<div class="' + opts.namespace + '--filter"><label>' + opts.filterLabelText + '</label></div>');
      filter.$input = $('<input type="text" value="" tabindex="-1" />').appendTo($el);
      filter.$reset = $('<button type="button" title="' + opts.resetButtonText + '" tabindex="-1">' + opts.resetButtonText + '</button>').appendTo($el);
      $el.prependTo(opts.list.$wrap);

      if (opts.options.length < opts.minItemFilter) {
        $el.hide();
      }
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


    _createBulkMarkup: function () {
      var self = this,
        opts = self.options,
        bulk = opts.bulk,
        $el;

      $el = bulk.$el = $('<div class="' + opts.namespace + '--bulk"></div>');
      bulk.$all = $('<button title="' + opts.bulkAllText + '" class="' + opts.namespace + '--bulk-all" tab-index="-1">' + opts.bulkAllText + '</button>').appendTo($el);
      bulk.$none = $('<button title="' + opts.bulkNoneText + '" class="' + opts.namespace + '--bulk-none" tab-index="-1">' + opts.bulkNoneText + '</button>').appendTo($el);
      $el.insertBefore(opts.list.$el);
    },


    _getOptions: function () {
      var self = this,
        data = [];

      // getting optionsdata from select
      $.each(self.element.find('option'), function (index, option) {
        var $option = $(option);

        data.push({
          disabled: $option.is(':disabled'),
          title:    $option.text(),
          value:    $option.val(),
          class:    $option.attr('class')
        });

        // if no attr val is set, it will be added, makes it all a whole lot easier
        if ($option.attr('value') === undefined) {
          $option.attr('value', $option.val());
        }
      });

      self.options.options.data = data;
      self.options.options.length = data.length;
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
          return opts.options.data.filter(function (obj) {
            return ($.inArray(obj.value, selected) !== -1);
          });
        } else {
          // single
          return opts.options.data.filter(function (obj) {
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
        $list = opts.list.$el,
        filterVal = false,
        options;

      $list.empty();
      self._getOptions();
      options = opts.options.data;

      // check if there is a need to filter the options
      if (opts.filter.$input && opts.options.length >= opts.minItemFilter) {
        filterVal = opts.filter.$input.val();
      }

      // create the list
      $.each(options, function (index, option) {
        // TOFIX: move out of anonymus function
        var oClass = option.class,
          $li;

        if (!filterVal || option.title.indexOf(filterVal) !== -1) {
          $li = $('<li>' + option.title + '</li>')
            .data({
              value:    option.value,
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
            self.setItemDisabledProp($li, true);
          }

          options[index].$el = $li;
        }
      });

      self.showSelected();
    },


    setItemDisabledProp: function ($item, disabled) {
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
      self._setFilterListener();
      if (self.options.bulkActions === true) {
        self._setBulkListener();
      }
    },


    _setSelectListener: function () {
      var self = this;

      // original select change
      self.element.on({
        change:             function (e) {
          self._refresh();
          self._trigger('change', e, {});
        },
        // dom manipulation
        DOMSubtreeModified: function () {
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
          ev.last = 'refocus';
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
        blur:  function (e) {
          if (ev.last === 'refocus') {
            self._reFocus();
          } else if (ev.last === 'noblur') {
            e.preventDefault();
          } else {
            self.close();
            ev.last = 'blur';
          }
        }
      });
    },


    _reFocus: function () {
      var opts = this.options;

      opts.event.last = 'refocus';
      opts.display.$el.focus(); // reset focus
    },


    _setFilterListener: function () {
      var self = this,
        opts = self.options,
        filter = opts.filter,
        ev = opts.event;

      filter.$reset.on('mousedown.ui-ms', function () {
        ev.last = 'refocus';
        filter.$input.val('');
        self._createListContent();
      });

      filter.$input.on({
        mousedown: function () {
          ev.last = 'noblur';
        },
        focus:     function () {
          ev.last = 'noblur';
        },
        blur:      function () {
          self._reFocus();
        },
        keyup:     function () {
          self._createListContent();
        }
      });
    },


    _setBulkListener: function () {
      var self = this,
        $el = self.element,
        $options = $el.find('option'),
        opts = self.options,
        bulk = opts.bulk;

      bulk.$all.on('mousedown.ui-ms', function (e) {
        e.preventDefault();
        self._reFocus();
        $options.prop('selected', true);
        $el.trigger('change');
      });

      bulk.$none.on('mousedown.ui-ms', function (e) {
        e.preventDefault();
        self._reFocus();
        $options.prop('selected', false);
        $el.trigger('change');
      })
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
          top:      offset.top + height,
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


    _updateFilterDisplay: function () {
      var self = this,
        opts = self.options,
        $el = opts.filter.$el;

      if (opts.minItemFilter !== -1 && opts.minItemFilter <= opts.options.length) {
        $el.show();
      } else {
        $el.hide();
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
        else if (len !== 0) {
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