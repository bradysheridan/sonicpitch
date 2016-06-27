$(function() {
  var socket = io.connect('http://localhost:8080');

  socket.on("posts", function(posts) {
    for (var i = 0; i < 4; i++) {
      populateSlide(posts[i], 100 * i, i);
    };

    function populateSlide(post, delay, i) {
      setTimeout(function() {
        var title = post.title.rendered,
            slug = post.slug,
            thumbnail = "";

        // Get featured media image URL
        $.getJSON(post._links['wp:featuredmedia'][0].href, function(body) {
          finalize(body.media_details.sizes.full.source_url);
        });

        function finalize(thumbnail) {
          $("#bg" + i).css({
            "background-image": "url(" + thumbnail + ")",
            "background-repeat": "no-repeat !important",
            "background-origin": "center !important",
            "background-position": "center !important",
            "background-size": "cover !important"
          });
          $("#bg" + i + " .title").html(title);
          var path = "#" + slug;
          $("#bg" + i + " a").attr('href', path);
        };
      }, delay);
    };
  });

  // Handle links
  $("a.delay").click(function(e) {
    e.preventDefault();
    var slug = $(this).attr('href');
    window.destination = slug;
    window.location.href = "/journal";
  });

});
