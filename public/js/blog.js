$(function() {
  var socket = io.connect('http://localhost:8080');

  var months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  // Populate filter buttons
  socket.on("cats", function(cats) {
    cats.forEach(function(cat) {
      var name = cat.name,
          id = cat.id,
          url = cat._links['wp:post_type'][0].href;

      $(".filter-wrap").append(generateFilter(name, id, url));
    });
  });

  // Return a ready to render filter button
  function generateFilter(name, id, url) {
    return $("<button class='filter inactive' slug='" + url + "'>" + name.toUpperCase() + "</button>");
  };

  // Populate blog posts
  socket.on("posts", function(posts) {
    var counter = 0;
    posts.forEach(function(post) {
      // Without delay, ordering of posts is not consistent with their respective
      // dates.
      populatePost(counter * 500, post);
      counter++;
    });

    function populatePost(delay, post) {
      setTimeout(function() {
        var dateUgly = new Date(post.date),
            date = months[dateUgly.getMonth()] + " " + dateUgly.getDate() + ", " + dateUgly.getFullYear();
        var featured_media = post.featured_media,
            title = post.title.rendered,
            body = post.content.rendered,
            slug = post.slug,
            thumbnail = "";

        // Get featured media image URL
        $.getJSON(post._links['wp:featuredmedia'][0].href, function(body) {
          storeThumbnail(body.media_details.sizes.full.source_url);
        });

        // Render the post
        function storeThumbnail(url) {
          $("#blog-wrap").append(generatePost(url, title, date, body, slug));
        };
      }, delay);
    };
  });

  // Return a ready to render blog post
  function generatePost(thumbnail, title, date, body, slug) {
    return $("<div class='post-wrap' id='" + slug + "'><div class='title-wrap'><img class='background' src='" + thumbnail + "' alt='The image failed to load, please refresh your browser.'/><p class='date'>" + date + "</p><h4 class='title'>" + title + "</h4></div><div class='body-wrap'>" + body + "</div></div>");
  };

  // Handle event listeners for filter buttons
  $(".filter-wrap").on("click", "button", function() {
    $(this).removeClass("inactive");
    $(this).addClass("active");
  });





});
