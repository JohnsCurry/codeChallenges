var express = require('express');
var session = require('express-session'); //remove this when you figure out how to do it.
var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash'); // remove flash?
var app = express();
var pg = require('pg');
var server;
var router = express.Router();
var validator = require('express-validator');
var DbDAO = require('./../dataObject.js').DbDAO;
var UserDAO = require('./../users').UserDAO;

var connectionString = "postgres://localhost:5432/startupinacar";

router.get('/addChallenge', function(req, res, next) {
  console.log("Hello from addChallenge in addChallenge.js");
  res.render('addChallenge');
});

var dbAccess = new DbDAO();

router.post('/addChallenge', function(req, res, next) {
  var itemTitle = req.body.title;
  var itemDescription = req.body.description;
  var itemPoints = req.body.points;
  var itemDifficulty = req.body.difficulty;
  var itemOutsideLink = req.body.outsideLink;

  dbAccess.addChallenge(itemTitle, itemDescription, itemPoints, itemDifficulty, itemOutsideLink, function(msg){
    if (msg === "error"){
      res.render('addChallenge');
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
