$(function() {
  var socket = io.connect('http://localhost:8080');


  // Implement this later if necessary
  $(".loading").hide();


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

      if (name != "Uncategorized") {
        $(".filter-wrap").append(generateFilter(name, id, url));
      }
    });
  });


  // Return a ready to render filter button
  function generateFilter(name, id, url) {
    return $("<button class='filter inactive' id='" + id + "' slug='" + url + "'>" + name.toUpperCase() + "</button>");
  };


  // Populate blog posts
  socket.on("posts", function(posts) {
    renderPosts(posts);
  });


  // Return a ready to render blog post
  function generatePost(thumbnail, title, date, body, slug, cats) {
    return $("<div class='post-wrap' cats='" + cats + "' id='" + slug + "'><div class='title-wrap'><img class='background' src='" + thumbnail + "' alt='The image failed to load, please refresh your browser.'/><p class='date'>" + date + "</p><h4 class='title'>" + title + "</h4></div><div class='body-wrap'>" + body + "</div></div>" + generateDisqussion(slug));
  };

  function generateDisqussion(slug) {
    // Generate thread div
    var thread = document.createElement("div");
    thread.id = "disqus_thread";

    // Generate script
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "../js/disqussion.js";
    s.identifier = slug;
    s.url = window.location.href + slug;

    // Generate noscript
    var ns = document.createElement("noscript");
    s.innerHTML = "Please enable JavaScript to view the <a href='https://disqus.com/?ref_noscript' rel='nofollow'>comments powered by Disqus.</a>";

    var wrap = document.createElement("div");
    wrap.appendChild(thread);
    wrap.appendChild(s);
    wrap.appendChild(ns);

    return wrap;
  };

  // Handle event listeners for filter buttons
  $(".filter-wrap").on("click", "button", function() {
    $(".filter-wrap button.filter").removeClass("active");
    $(this).addClass("active");

    var id = $(this).attr('id').toString();
    var postsURL = $(this).attr('slug');

    // Hide non-essential posts
    $(".post-wrap").each(function() {
      var postCats = $(this).attr('cats').toString();
      var filterCat = id;

      if (postCats.indexOf(filterCat) != -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });


  /*
   *  Passed a JSON of blog posts. Renders each blog post and pushes it
   *  to blog container.
   */
  function renderPosts(posts) {
    var counter = 0;
    posts.forEach(function(post) {
      // Without delay, ordering of posts is not consistent with their respective
      // dates.
      populatePost(counter * 300, post);
      counter++;
    });

    function populatePost(delay, post) {
      setTimeout(function() {
        // Format date
        var dateUgly = new Date(post.date),
            date = months[dateUgly.getMonth()] + " " + dateUgly.getDate() + ", " + dateUgly.getFullYear();

        // Format categories prop
        var catsUgly = post.categories,
            cats = "";
        catsUgly.forEach(function(cat) {
          cats += cat + ",";
        });

        // Get info that doesn't need formatting
        var title = post.title.rendered,
            body = post.content.rendered,
            slug = post.slug,
            featured_media = post.featured_media;

        // Get featured media image URL
        $.getJSON(post._links['wp:featuredmedia'][0].href, function(body) {
          storeThumbnail(body.media_details.sizes.full.source_url);
        });

        // Render the post
        function storeThumbnail(url) {
          $("#blog-wrap").append(generatePost(url, title, date, body, slug, cats));
          $("#blog-wrap").append(generateDisqussion(slug));
        };
      }, delay);
    };
  };


});
