$(function() {
  if (location.hostname == "localhost") {
    var socket = io.connect(location.protocol + "//" + location.hostname + ":8000");
  } else {
    var socket = io.connect(location.protocol + "//" + location.hostname + ":80");
  }
  // var socket = io.connect("54.226.247.57:8081");
  // var socket = io.connect("https://54.226.247.57:8081");

  var currSlug = "";

  // Implement this later if necessary
  $("#disqus_thread").hide();

  // Increment after loading more posts
  var currPage = 1;

  // Show loading at first
  $("button.load-more").html("Loading...");
  setTimeout(function() {
    $("button.load-more").html("MORE");
  }, 3000);

  // For date formatting
  var months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  // id: 'category_name' associative array for category rendering in posts
  var assCats = {};

  // Populate filter buttons
  socket.on("cats", function(cats) {
    console.log("got cats");

    cats.forEach(function(cat) {
      var name = cat.name,
          id = cat.id,
          url = cat._links['wp:post_type'][0].href;

      assCats[id] = name;

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
    console.log("got posts");
    renderPosts(posts);
  });


  // Return a ready to render blog post
  function generatePost(thumbnail, title, date, body, slug, cats) {
    // Generate the correct category string
    var categories = cats.split(',');
    var catString = "";
    for (var i = 0; i < categories.length; i++) {
      if (categories[i] != 0) {
        catString += assCats[categories[i]] + " - ";
      }
    }
    catString = catString.substring(0, catString.length - 3);

    // Render the post, injecting all params
    return $("<div class='post-wrap' cats='" + cats + "' id='" + slug + "'><div class='title-wrap'><img class='background' src='" + thumbnail + "' alt='The image failed to load, please refresh your browser.'/><p class='date'>" + date + "</p><p class='cats'>" + catString + "</p><h4 class='title'>" + title + "</h4></div><div class='body-wrap'>" + body + "</div><div class='comment-wrap'><button slug='" + slug + "' class='comment'>COMMENT</button></div></div>");
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
        };
      }, delay);
    };
  };

  // Toggle control variable
  var disqusActive = false;

  // Open comment box
  $("#blog-wrap").on("click", "button.comment", function() {
    var slug = $(this).attr('slug');
    reset("id-" + slug, window.location.href + "/#" + slug, slug, 'en');
    $("#disqus_thread").slideDown("fast", function() {
      disqusActive = true;
    });
  });

  // Close comment box
  $("html").click(function(e) {
    if (!$(e.target).is('#disqus_thread') && disqusActive) {
    	$("#disqus_thread").slideUp("fast", function() {
        disqusActive = false;
      });
    }
  });


  /*
   *  Loads a fresh batch of 10 posts and appends them after the current pages
   */
   $("body").on("click", "button.load-more", function() {
     // Increment page counter
     currPage++;

     $("button.load-more").html("Loading...");
     setTimeout(function() {
       $("button.load-more").html("MORE");
     }, 3000);

     // Check if there's an active button
     var activeFilter = $("button.active").attr('id');

     // Get another set of posts from this category, if a filter is active
     $.getJSON("http://sonicpitch.com/wp-json/wp/v2/posts?page=" + currPage, function(body) {
       renderPosts(body);
     });

     $("button.active").removeClass('active');

   });

});
