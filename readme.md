# jQuery UI Multiselect Widget #

## THIS IS WORK IN PROGRESS
aka there is a whole lot todo to get a first working version ready.
further details, plans, descriptions yadda yadda will be added later.



### Basic ideas and concept
![wireframe](/demo/img/wireframe.png)



## Setup

### init / minimal setup
```javascript
$('#mySelectField').multiselect();
```

### setup
```javascript
$('#mySelectField').multiselect({
  maxItems: 1,
  min-width: 200
});
```

### Options
- hideSelect (true) » show/hide original select-field
- showCheckbox (true) » show/hide checkboxes in the list (multiselect only)
- selectAll (true) » not yet implemented
- minItemFilter (5) » not yet implemented
- maxItems (3) » max the number of selected items that will be displayed by option-title
- minWidth (0) » minimal width of ui-element (trigger and list); 0 = auto



## Events
- complete » widget initiation is finished
- update » ui has been updated to fit latest changes 
- change » select-value has been changed
- select » value has been selected
- open » list is displayed
- close » list is closed



## TODOs
- write basic functionality
- possibility to display infinite number of selected items
- fix grunt lint-tasks
- set trigger and ("keyboard"-) listener
- add class of selected value to display (button) + option
- write demos
- write propper description
- handle disabled options
- (de-) select-all option
- filter functionality
- max-selectable option
- optgroup support
- clean-up and optimizing
- minifiying
- touch-support?
- drink a beer