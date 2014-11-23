/*
 login test
 */

var config = {
  url:  'http://local.jquery-ui.multiselect.widget/demo/'
};

casper.test.begin('init', 4, function suite (test) {
  casper.start(config.url, function () {

    // selectors
    var single = 'select#single',
      multi = 'select#multi';

    // check for elements
    this.echo('‣ checking for elements');
    this.test.assertExists(single, 'single select is present');
    this.test.assertExists(multi, 'multi select is present');

    this.echo('‣ checking for widget-ui');
    this.test.assertVisible(single + ' + .ui-multiselect--display', 'display is visible');
    this.test.assertExists('.ui-multiselect--list-wrap', 'list wrap exists');
  });

  casper.run(function () {
    test.done();
  });
});