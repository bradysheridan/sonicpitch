// Dependencies
var express = require('express');
var path = require('path');
var app = express();
var request = require("request");

//
var wpURL = "http://sonicpitch.com/wp-json/wp/v2/posts";
request({
  url: wpURL,
  json: true
}, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    console.log(body); // Print the json response
  }
});

// Look in '/public' when serving files
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'public/views'));

// Have EJS drive views
app.set("view engine", "ejs");

// Index page
app.get('/', function(req, res) {
  res.render('pages/index');
});

// WHAT I'M DOING NOW
app.get('/now', function(req, res) {
  res.render('pages/index');
});

// BLOG
app.get('/blog', function(req, res) {
  res.render('pages/blog');
});

// PLACES
app.get('/places', function(req, res) {
  res.render('pages/places');
});

// ABOUT
app.get('/about', function(req, res) {
  res.render('pages/about');
});

// CONTACT
app.get('/contact', function(req, res) {
  res.render('pages/contact');
});

// Set port
var port = 8000;
app.listen(port);
console.log("SONICPITCH is listening on port " + port);
