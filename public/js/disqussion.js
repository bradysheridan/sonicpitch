/* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
var disqus_shortname = 'sonicpitch';
var disqus_identifier = 'id1';
var disqus_url = window.location.href + "id1";
var disqus_config = function () {
  this.language = "en";
};

/* * * DON'T EDIT BELOW THIS LINE * * */
(function() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();

/* * * Disqus Reset Function * * */
var reset = function (newIdentifier, newUrl, newTitle, newLanguage) {
  DISQUS.reset({
    reload: true,
    config: function () {
      this.page.identifier = newIdentifier;
      this.page.url = newUrl;
      this.page.title = newTitle;
      this.language = newLanguage;
    }
  });
};
