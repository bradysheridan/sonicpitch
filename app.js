// Dependencies
var express = require('express'),
    path = require('path'),
    app = express(),
    http = require('http')
    request = require('request');

var port = process.env.PORT || 8000;
var APPNAME = require('./package.json').name;

var server = http.createServer(app).listen(port, function () {
  var address = this.address();
  console.log('%s worker %d running on http://%s:%d',
    APPNAME, process.pid, address.address, address.port);
});

var io = require('socket.io')(server);

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
  res.render('pages/now');
});

// BLOG
app.get('/journal', function(req, res) {
  res.render('pages/journal');
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

// Fetch blog data from Wordpress
var postURL = "http://sonicpitch.com/wp-json/wp/v2/posts?page=1";
var postData;

// Gets JSON data and passes to a callback function to save in local variable
function getBlogData(url, callback) {
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body);
    }
  });
}

// Do the work, store JSON locally in blogData
getBlogData(postURL, function (body) {
  postData = body;
});

// Fetch categories data from Wordpress
var catURL = "http://sonicpitch.com/wp-json/wp/v2/categories";
var catData;

function getCatData(url, callback) {
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body);
    }
  });
};

getCatData(catURL, function(body) {
  catData = body;
});


// Socket.io fetches and delivers the Wordpress JSON for blog data
io.on("connection", function(socket) {
  console.log("a connection was ")
  // A client connected
  console.log("");
  console.log("Socket.io");
  console.log("=-=-=-=-=");
  console.log("A connection was made.");
  console.log("");

  // Send posts to the client
  socket.emit("posts", postData);
  socket.emit("cats", catData);

  // A client disconnected
  socket.on("disconnect", function() {
    console.log("");
    console.log("Socket.io");
    console.log("=-=-=-=-=");
    console.log("The user disconnected.");
    console.log("");
  });
});

module.exports = app;
