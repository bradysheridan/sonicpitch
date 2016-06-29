$(function() {

  // Cache DOM
  var $loadMore = $("button.load-more");
  var $page = $("#page-content-wrapper");

  // Handle 'to-top' button
  $("#to-top").click(function(e) {
    e.preventDefault();
    $page.stop().animate({scrollTop:0}, '500', 'swing');
  });


  // Increment after loading more posts
  var currPage = 1;

  // Initialize the page
  getCats();
  getPosts(null, currPage);

  // Show loading at first
  $loadMore.html("Loading...");
  setTimeout(function() {
    $loadMore.html("MORE");
  }, 3000);

  // For date formatting
  var months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  // Handle event listeners for filter buttons
  $(".filter-wrap").on("click", "button", function() {

    // Toggle styles on the filter
    $(".filter-wrap button.filter").removeClass("active");
    $(this).addClass("active");

    // Find out which filter was clicked
    var id = $(this).attr('id').toString();

    // Hide non-essential posts
    if (id == 1) {
      $(".post-wrap").each(function() {
        $(this).show();
      });
    } else {
      $(".post-wrap").each(function() {
        var postCats = $(this).attr('cats').toString();
        var filterCat = id;

        if (postCats.indexOf(filterCat) > -1) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    }
  });


  /*
   *  Loads a fresh batch of 10 posts and appends them after the current pages
   */
   $("body").on("click", "button.load-more", function() {

     // Indicate that we're loading more posts
     $("button.load-more").html("Loading...");
     setTimeout(function() {
       $("button.load-more").html("MORE");
     }, 3000);

     // Check if there's an active filter
     var activeFilter = $("button.active").attr('id');

     // Get more posts
     getPosts(activeFilter, currPage);

     // Deactivate filter
     $("button.active").removeClass("active");
   });

  /**
    *   Generates a JSON response containing blog posts
    *   Params:
    *   =-=-=-=
    *   cat: { numeric category filter; specify 0 if generic search },
    *   page: { indexed page number }
  **/
  function getPosts(cat, page) {

    // If cat id is 0, do generic GET
    if (cat!= null && cat <= 1) {

      $.getJSON("http://sonicpitch.com/wp-json/wp/v2/posts?categories=" + cat + "?page=" + currPage, function(body) {
        renderPosts(body);
      }).error(function() {
        // Ran out of pages to load
        $loadMore.hide();
      }).success(function() {
        // Increment page counter if the GET was a success
        currPage++;
      });

    } else {

      $.getJSON("http://sonicpitch.com/wp-json/wp/v2/posts?page=" + currPage, function(body) {
        renderPosts(body);
      }).error(function() {
        // Ran out of pages to load
        $loadMore.hide();
      }).success(function() {
        // Increment page counter if the GET was a success
        currPage++;
      });

    }
  };


  /*
   *  Passed a JSON of blog posts. Renders each blog post and pushes it
   *  to blog container.
   */
  function renderPosts(posts) {

    // Initialize delay multiple
    var counter = 0;

    posts.forEach(function(post) {
      // Without delay, ordering of posts is not consistent with their respective dates.
      populatePost(counter * 300, post);

      // Increment delay multiple
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

        $("#blog-wrap img").each(function() {
          $(this).wrap("<p style='text-align:center;'></p>");
        });
      }, delay);
    };
  };


  /**
    *   Returns a read to render categorical filter
  **/
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


  /**
    *   Generates a JSON response containing blog posts
    *   Params:
    *   =-=-=-=
    *   cat: { numeric category filter; specify 0 if generic search },
    *   page: { indexed page number }
  **/
  function getCats() {

    $.getJSON("http://sonicpitch.com/wp-json/wp/v2/categories", function(body) {
      renderFilters(body);
    });

  };


  // Associative array for category rendering in posts
  // Format:
  // =-=-=-=
  // {[id: 'name']}
  var assCats = {};


  /**
    *   Renders the buttons for categories returned by getCats()
  **/
  function renderFilters(cats) {

    // Loop through categories
    cats.forEach(function(cat) {
      var name = cat.name,
          id = cat.id,
          url = cat._links['wp:post_type'][0].href;

      // Keep track of categories we've rendered
      assCats[id] = name;

      // Render the filter for this category
      if (name != "Uncategorized")
        $(".filter-wrap").append(generateFilter(name, id, url));
    });

  };


  /**
    *   Return a ready to render filter button
  **/
  function generateFilter(name, id, url) {
    return $("<button class='filter inactive' id='" + id + "' slug='" + url + "'>" + name.toUpperCase() + "</button>");
  };

  setTimeout(function() {
    $("p strong a img").each(function() {
      $(this).parent().parent().parent().css({"text-align": "center"});
    });
  }, 3000);

});
