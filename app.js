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

module.exports = app;
