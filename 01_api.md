---
layout: page
title: API
permalink: /api/
---

If you're more interested in the why than the how, check the [about page](../about).



## Options ##

#### <code>hideSelect</code>

- default: true
- show/hide original select-field


#### <code>showCheckbox</code>

- default: true
- show/hide checkboxes in the list (multiselect only)
- [demo](../demos#hide-checkboxes)


#### <code>selectAll</code>

- default: true
- not yet implemented


#### <code>minItemFilter</code>

- default: 5
- not yet implemented


#### <code>maxItems</code>
- default: 3
- max the number of selected items that will be displayed by option-title; -1 will display all selected items
- [demo](../demos/#max-items)


#### <code>minWidth</code>

- default: 0
- minimal width of ui-element (trigger and list)
- 0 = auto


#### <code>defaultDisplayTitle</code>

- default: 'No value selected'
- display title, when no item is selected
- [demo](../demos/#custom-title)


#### <code>displayTextSG</code>

- default: '1 of ## value selected'
- display title for one selected item, 
- depends on <code>maxItems</code>
- [demo](../demos/#custom-title)

#### <code>displayTextPL</code>

- default: '@@ of ## values selected'
- [demo](../demos/#custom-title)


## Events ##

- <code>complete</code> » widget initiation is finished
- <code>update</code> » ui has been updated to fit latest changes
- <code>change</code> » select-value has been changed
- <code>select</code> » value has been selected
- <code>open</code> » list is displayed
- <code>close</code> » list is closed

An important thing to mention: the <code>click</code> event needs actually to be a mousedown, 
to be able to handle it before the blur of the display.