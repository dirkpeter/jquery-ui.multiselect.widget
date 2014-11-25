// load config
var config = require('./config.js');


casper.test.begin('basic functionality tests', 9, function suite (test) {
  'use strict';

  casper.start(config.url + '#basic_init_multi', function () {
    // test elements
    var ms = 'select',
      display = '.ui-multiselect--display',
      list = '.ui-multiselect--list-wrap',
      li3 = list + ' li:nth-child(3)';


    // casper.capture(config.img + 'list.png');

    // waiting for page to load (local ajax...)
    casper.wait(500, function() {
      // check for elements
      this.test.assertExists(ms, 'select is present');
      this.test.assertVisible(display, 'display is visible');
      this.test.assertExists(list, 'list wrap exists');
      this.test.assertNotVisible(list, 'list is hidden');

      // open & close list
      this.click(display);
      this.test.assertVisible(list, '(display click) list is visible');
      this.click(display);
      this.test.assertNotVisible(list, '(display click) list is hidden');

      //select an item
      this.click(display);
      this.click(li3);

      // test select value
      var val = casper.evaluate(function (el) {
        return jQuery(el).val();
      }, ms);
      this.test.assertEquals(val, ['3'], 'expected value selected');

      // test displayed value
      var title = casper.evaluate(function (el) {
        return jQuery(el).text();
      }, display);
      this.test.assertEquals(title, 'lorem 3', 'expected value displayed');

      // test displayed value
      var checkbox = casper.evaluate(function (el) {
        return jQuery(el).prop('checked');
      }, li3 + ' input');
      this.test.assertEquals(checkbox, true, 'checkbox is selected');
    });
  });

  casper.run(function () {
    test.done();
  });
});