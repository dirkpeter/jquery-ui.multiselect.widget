(function ($) {
  var $main;

  var loadTest = function (testname) {
    $.get(testname + '.html')
      .done(function (test) {
        $main.html(test);
      })
      .fail(function () {
        $main.html('<p>there is no such test</p>');
      });
  };

  $(function () {
    $main = $('#main');

    $(window)
      .on('hashchange', function () {
        $('.multiselect').multiselect('destroy');
        loadTest(location.hash.substr(1));
      })
      .trigger('hashchange');
  });
})(jQuery);