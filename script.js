$(function() {
  $(".dark").click(function() {
    $("#feed").addClass('dark');
  });
  $(".light").click(function() {
    $("#feed").removeClass('dark');
  });
  var url = 'http://zakupki.gov.ru/epz/order/quicksearch/rss?searchString=%D0%B7%D0%B0%D0%BA%D1%83%D0%BF%D0%BA%D0%B8+%D0%B4%D0%B5%D0%BA%D0%BE%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D0%B3%D0%BE+%D0%BF%D0%BE%D1%81%D0%B0%D0%B4%D0%BE%D1%87%D0%BD%D0%BE%D0%B3%D0%BE+%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D0%B0&morphology=on';
  
  $.ajax({
    type: "GET",
    url: document.location.protocol + '//api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url),
    dataType: 'json',
    error: function() {
      $("#feed").after("<center>Unable to load feed, Incorrect path or invalid feed</center>");
    },
    success: function(xml) {
      values = xml.items;

      for (var i = 0, j = values.length; i < j; i++) {
        // console.log(values[i]);

        $("#feed").append("<li><a href='" + values[i].link + "' target='_blank'>" + values[i].title + "</a><br><i>" + values[i].author + "</i><a href='" + values[i].link + "' class='apply'  target='_blank'>перейти</a><div>" + values[i].content + "</div></li>");
      }
    }
  });
});
