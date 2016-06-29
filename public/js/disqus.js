$(function() {

  // Cache DOM
  var disqusThread = $("#disqus_thread");

  // Hide disqusThread initially
  disqusThread.hide();

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
});
