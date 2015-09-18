(function ($, undefined) {
  $.widget('ui.multiselect', {
    // default options
    options: {
      // config
      hideSelect:    true,
      showCheckbox:  true,
      bulkActions:   true,
      bulkToggle:    true,
      minItemFilter: 5,
      maxItems:      3,
      minWidth:      0, // auto

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
      namespace:       'ui-multiselect',
      eventNamespace:  'ui-ms',
      tabIndex:        ' tabindex="-1"',
      isDisabled:      false,
      isMultiple:      false,
      isOpen:          false,
      event:           {
        last: undefined
      },
      display:         {
        $el:    undefined,
        $title: undefined
      },
      list:            {
        $wrap:    undefined,
        $el:      undefined,
        $options: undefined
      },
      filter:          {
        isVisible: false,
        $el:       undefined,
        $input:    undefined,
        $reset:    undefined
      },
      bulk:            {
        $el:     undefined,
        $all:    undefined,
        $none:   undefined,
        enabled: false
      },
      options:         {
        data:   [],
        length: 0
      },
      hasOptgroup:     false,
      optgroupDataKey: 'jqms-group-id',
      optgroups:       {
        data:   [],
        length: 0
      },
      selected:        []
    },


    _create: function () {
      var self = this,
        $el = self.element,
        opts = self.options;

      // hide select
      if (opts.hideSelect !== false) {
        $el.hide();
      }

      self._propertyChecks();

      // add id-class
      $el.addClass(opts.namespace);

      // create markup ~ hey ho, let's go! ~
      self._createMarkup();
    },


    _init: function () {
      var self = this;

      self._setListener();
      self.refresh();

      self._trigger('complete', null, {});
    },


    _propertyChecks: function () {
      var self = this,
        $el = self.element;

      // check for multi- or single-select
      self.options.isMultiple = ($el.attr('multiple') !== undefined);

      // check if select is disabled
      self.options.isDisabled = $el.prop('disabled');

      // check for optgroups
      self.options.hasOptgroup = ($el.find('optgroup').length > 0);
    },


    refresh: function () {
      var self = this;

      self._propertyChecks();
      self._getValues();
      self.showSelected();
      self.setTitle();
      self._updateFilterDisplay();

      self._trigger('refresh', null, {});
    },


    update: function () {
      var self = this;

      self._createListContent();
      self.refresh();

      self._trigger('update', null, {});
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
      var self = this,
        opts = self.options;

      self._createDisplay();
      self._createList();
      self._createFilterMarkup();
      if (opts.isMultiple && opts.bulkActions === true) {
        self._createBulkMarkup();
      }
    },


    _createFilterMarkup: function () {
      var self = this,
        opts = self.options,
        filter = opts.filter,
        $el;

      $el = filter.$el = $('<div class="' + opts.namespace + '--filter"><label>' + opts.filterLabelText + '</label></div>');
      filter.$input = $('<input type="text" value=""' + opts.tabIndex + ' />').appendTo($el);
      filter.$reset = $('<button type="button" title="' + opts.resetButtonText + '"' + opts.tabIndex + '>' + opts.resetButtonText + '</button>').appendTo($el);
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
      btn.$el = $('<button type="button" class="' + namespace + '--display"></button>')
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
      bulk.$all = $('<button type="button" title="' + opts.bulkAllText + '" class="' + opts.namespace + '--bulk-all"' + opts.tabIndex + '>' + opts.bulkAllText + '</button>').appendTo($el);
      bulk.$none = $('<button type="button" title="' + opts.bulkNoneText + '" class="' + opts.namespace + '--bulk-none"' + opts.tabIndex + '>' + opts.bulkNoneText + '</button>').appendTo($el);
      $el.insertBefore(opts.list.$el);
    },


    _getOptions: function () {
      var self = this,
        data = [],
        dataKey = self.options.optgroupDataKey;

      // getting optionsdata from select
      $.each(self.element.find('option'), function (index, option) {
        var $option = $(option);

        data.push({
          groupID:  $option.data(dataKey), // apply group id - if set
          source:   $option,
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


    _getOptgroups: function () {
      var self = this,
        dataKey = self.options.optgroupDataKey,
        $groups = self.element.find('optgroup'),
        data = [];

      // fetch some data
      $groups.each(function (index, group) {
        var id = index + 1, // prevent zeros
          $group = $(group).data(dataKey, id), // add relation-info to group - dunno if i'll need id...
          $options = $group.find('option');

        data.push({
          id:       id,
          source:   $group,
          $el:      undefined,
          $list:    undefined,
          selected: false,
          disabled: $group.is(':disabled'),
          label:    $group.attr('label'),
          class:    $group.attr('class'),
          length:   $options.length
        });

        $options.data(dataKey, id); // apply relation-info to options - that one is needed
      });

      // set some data ;)
      self.options.optgroups.data = data;
      self.options.optgroups.length = $groups.length;
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
        // is multi
        if (opts.isMultiple) {
          return opts.options.data.filter(function (obj) {
            return $.inArray(obj.value, selected) !== -1;
          });
        }
        // is single
        else {
          return opts.options.data.filter(function (obj) {
            return (obj.value === String(selected));
          });
        }
      }

      return null;
    },


    _updateOptgroupStatus: function () {
      var self = this,
        opts = self.options,
        optgroups = opts.optgroups.data;

      // only if optgroups are present and it's a multi-select
      if (opts.hasOptgroup && opts.isMultiple) {

        // collect groups by selected options and count their length
        for (var i = 0, len = opts.optgroups.length; i < len; i += 1) {
          var optGroup = optgroups[i],
            options;

          // .prop('selected')
          options = self._getOptionsByGroupID(optGroup.id).filter(function (obj) {
            return obj.source.prop('selected');
          });
          optGroup.selected = (optGroup.length === options.length);
        }
      }
    },


    getSelected: function (inclOptgroupLabels) {
      var self = this,
        opts = self.options,
        selected = self.getSelectedOptions();

      inclOptgroupLabels = inclOptgroupLabels || false;

      // only if optgroups are present and it's a multi-select
      if (inclOptgroupLabels && opts.hasOptgroup && opts.isMultiple && selected) {
        var groups = opts.optgroups.data.filter(function (obj) {
          return obj.selected;
        });
        selected = $.extend(selected, groups);
      }

      return selected;
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

      // add css helper classes
      if (opts.isMultiple === true) {
        $wrap.addClass(namespace + '--is-multiple');
      }
      if (opts.hasOptgroup === true) {
        $wrap.addClass(namespace + '--has-optgroup');
      }

      // append the whole thing
      $wrap.appendTo('body');
    },


    _getOptgroupByID: function (id) {
      var groups = this.options.optgroups;

      for (var i = 0; i < groups.length; i++) {
        if (groups.data[i].id === id) {
          return groups.data[i];
        }
      }

      return false;
    },


    _getOptionsByGroupID: function (groupID) {
      var options = this.options.options,
        data = [];

      for (var i = 0; i < options.length; i++) {
        if (options.data[i].groupID === groupID) {
          data.push(options.data[i]);
        }
      }

      return data;
    },


    _createOptgroupmarkup: function (groupID) {
      var self = this,
        opts = self.options,
        namespace = opts.namespace,
        groupData = self._getOptgroupByID(groupID),
        $label,
        $el;

      // set helper & create el, label and ul (options)
      $el = groupData.$el = $('<li class="' + namespace + '--optgroup-wrap"></li>')
        .data(opts.optgroupDataKey, groupID)// needs to be done this way, since i can't use a var as object-key - maybe not clever anyways
        .data('disabled', groupData.disabled);
      $label = groupData.$label = $('<label>' + groupData.label + '</label>').appendTo($el);
      groupData.$list = $('<ul class="' + namespace + '--outgroup-list"></ul>').appendTo($el);

      // multi- & checkbox-handing
      if (opts.isMultiple && opts.showCheckbox) {
        $('<input type="checkbox" value="" />').prependTo($label);
      }

      // disabled handling
      if (groupData.disabled === true) {
        self.setItemDisabledProp($el, true);
      }

      return groupData;
    },


    _createListContent: function () {
      var self = this,
        opts = self.options, // widget options
        hasGroups = opts.hasOptgroup,
        namespace = opts.namespace,
        list = opts.list,
        $list = list.$el,
        group = {
          id: 0 // prevent error on first iteration
        },
        options;

      // kill list content, no markup duplication!
      $list.empty();

      // let's fetch all the required data
      if (hasGroups === true) {
        self._getOptgroups(); // has to be called before _getoptions
      }
      self._getOptions();
      options = self._filterOptions(opts.options.data); // pre-filter options

      // create the list
      $.each(options, function (index, option) {
        var oClass = option.class,
          $li;

        option.isGroup = (option.groupID !== undefined);

        // create a group-el if a new group of items is iterated
        if (hasGroups === true && option.groupID !== group.id && option.isGroup) {
          group = self._createOptgroupmarkup(option.groupID);
          group.$el.appendTo($list); // preferable added in one after children are attached
        }

        $li = $('<li class="' + namespace + '--option">' + option.title + '</li>')
          .data({
            value:    option.value,
            disabled: option.disabled
          });

        // append item to list or group
        $li.appendTo((hasGroups === true && option.isGroup) ? group.$list : $list);

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
      });

      // min-width for wrap
      if (opts.minWidth !== 'auto') {
        opts.list.$wrap.css('min-width', opts.minWidth);
      }

      self.showSelected();
    },


    _filterOptions: function (options) {
      var self = this,
        opts = self.options, // widget options
        list = opts.list,
        $wrap = list.$wrap,
        filterCLass = opts.namespace + '--has-filter',
        filterVal = '',
        filtered = [],
        filter;

      // check if there is a need to filter the options
      if (opts.filter.$input && opts.options.length >= opts.minItemFilter) {
        filterVal = self.getFilterValue();
        filterVal = filterVal.toLowerCase();
      }
      filter = (filterVal !== '');

      if (filter) {
        // filter options
        // TODO better filtering... regex?!
        $.each(options, function (index, option) {
          var title = option.title.toLowerCase();

          if (!filterVal || title.indexOf(filterVal) !== -1) {
            filtered.push(option);
          }
        });
      }
      else {
        filtered = options; // no filter, all options
      }

      // add filter class
      $wrap.toggleClass(filterCLass, filter);

      self._trigger('filter', null, {value: filterVal});

      return filtered;
    },


    getFilterValue: function () {
      return this.options.filter.$input.val();
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


    _reFocus: function () {
      var opts = this.options;

      opts.event.last = 'refocus';
      opts.display.$el.focus(); // reset focus
    },


    _setListener: function () {
      var self = this,
        opts = self.options;

      self._setSelectListener();
      self._setDisplayListener();
      self._setListListener();
      self._setFilterListener();

      // for multi only
      if (opts.isMultiple) {
        if (opts.bulkActions === true) {
          self._setBulkListener();
        }

        if (opts.hasOptgroup === true) {
          self._setOptgroupListener();
        }

        // prevent checkbox-click (optgroup and option)
        if (opts.showCheckbox) {
          self._setCheckboxListener();
        }
      }

      self._setKeyboardListener();
    },


    _setCheckboxListener: function () {
      this.options.list.$el.on('click', 'input', function (e) {
        e.preventDefault();
        return false;
      });
    },


    _setSelectListener: function () {
      var self = this;

      // original select change
      self.element.on({
        change:             function (e) {
          self.refresh();
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
      opts.list.$el.on('mousedown.ui-ms', '.' + opts.namespace + '--option', function (e) {
        e.stopPropagation(); // in case optgroups are used

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

        self._trigger('toggleOption', e, {'value': value});
      });
    },


    _setOptgroupListener: function () {
      var self = this,
        opts = self.options;

      opts.list.$el.on({
          'mousedown.ui-ms': function () {
            var id = $(this).data(opts.optgroupDataKey),
              group = self._getOptgroupByID(id);

            group.selected = (group.selected === false);

            opts.event.last = 'refocus';
            self._toggleValue(self._getOptionsByGroupID(id), group.selected);
          },
          // prevent label:focus / display:blur
          'focus.ui-ms':     function (e) {
            e.preventDefault();
            opts.event.last = 'noblur';
            self._reFocus();
          }
        },
        '.' + opts.namespace + '--optgroup-wrap'
      );
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
        bulk = self.options.bulk;

      bulk.$all.on('mousedown.ui-ms', function (e) {
        e.preventDefault();
        self._bulkToggle(true); // enable
        self._reFocus();
        $el.trigger('change');
      });

      bulk.$none.on('mousedown.ui-ms', function (e) {
        e.preventDefault();
        self._bulkToggle(false); // disable
        self._reFocus();
        $el.trigger('change');
      });
    },


    _setKeyboardListener: function () {
      var self = this,
        opts = self.options,
        $el = opts.display.$el,
        filter = opts.filter;

      // when open
      $el.keydown(function (e) {
        switch (e.keyCode) {
          // esc » close widget
          case 27:
            self.close();
            break;

          // tab » focus filter
          case 9:
            //console.log('tab', opts.filter.isVisible);

            // only action if filter is visible
            if (filter.isVisible) {
              //console.log(filter.$input);
              e.preventDefault();
              opts.event = 'noblur';
              filter.$input.focus();
            }
            break;
        }
      });

      /*
       - tab (on filter) » close widget
       - up / down » focus option
       - space (on option focus) » toggle option
       - [key] » (de-) select all
       */
    },


    _bulkToggle: function (status) {
      var self = this,
        options = self._filterOptions(self.options.options.data);

      if (self.options.bulkToggle) {
        $.each(options, function (index, option) {
          option.source.prop('selected', status);
        });
      }
      else {
        self.element.find('option').prop('selected', status);
      }
    },


    _toggleValue: function (val, setValue, triggerChange) {
      var self = this,
        opts = self.options,
        $el = self.element,
        value;

      triggerChange = triggerChange || true;

      // if option-array, toggle all options
      if (Array.isArray(val)) {
        for (var i = 0, len = val.length; i < len; i++) {
          self._toggleValue(val[i].value, setValue, false);
        }
      }

      if (opts.isMultiple) {
        value = (setValue !== undefined) ? setValue : ($.inArray(String(val), opts.selected) === -1);
        $el.find('[value="' + val + '"]').prop('selected', value);
        self._updateOptgroupStatus();
      } else {
        $el.find('[value="' + val + '"]').prop('selected', true);
      }

      if (triggerChange === true) {
        $el.trigger('change');
      }
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
        selected = self.getSelected(true),
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
        filter = opts.filter,
        $el = filter.$el;

      if (opts.minItemFilter !== -1 && opts.minItemFilter <= opts.options.length) {
        $el.show();
        filter.isVisible = true;
      } else {
        $el.hide();
        filter.isVisible = false;
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
