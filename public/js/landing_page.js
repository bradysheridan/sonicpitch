$(function() {
  if (location.hostname == "localhost") {
    var socket = io.connect(location.protocol + "//" + location.hostname + ":8000");
  } else {
    var socket = io.connect(location.protocol + "//" + location.hostname + ":80");
  }
  // var socket = io.connect("54.226.247.57:8081");
  // var socket = io.connect("https://54.226.247.57:8081");

  socket.on("posts", function(posts) {
    console.log("got posts");

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
          $("button.btn-read-more").show();
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
