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

### setup example
min-width of 200px and an infinite number of selected items displayed
```javascript
$('#mySelectField').multiselect({
  maxItems: -1,
  min-width: 200
});
```

### Options
- hideSelect (true) » show/hide original select-field
- showCheckbox (true) » show/hide checkboxes in the list (multiselect only)
- selectAll (true) » not yet implemented
- minItemFilter (5) » not yet implemented
- maxItems (3) » max the number of selected items that will be displayed by option-title; -1 will display all 
selected items
- minWidth (0) » minimal width of ui-element (trigger and list); 0 = auto



## Events
![wireframe](/demo/img/events.png)

- complete » widget initiation is finished
- update » ui has been updated to fit latest changes 
- change » select-value has been changed
- select » value has been selected
- open » list is displayed
- close » list is closed