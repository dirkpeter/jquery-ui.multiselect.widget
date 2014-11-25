(function ($) {
  var $main;

  var loadTest = function (testname) {
    $.get(testname + '.html')
      .done(function (test) {
        $main.hide().html(test).show('slow');
      })
      .fail(function () {
        $main.html('<p>there is no such test</p>');
      });
  };

  $(function () {
    $main = $('#main');

    $(window)
      .on('hashchange', function () {
        var $ui = $('.ui-multiselect');

        if ($ui.length) {
          $ui.multiselect('destroy');
        }

        loadTest(location.hash.substr(1));
      })
      .trigger('hashchange');
  });
})(jQuery);