var express = require('express');
var session = require('express-session'); //remove this when you figure out how to do it.
var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash'); // remove flash?
var app = express();
var pg = require('pg');
var server;
var router = express.Router();
var validator = require('express-validator');
var DbDAO = require('./../dataObject.js').DbDAO;
var UserDAO = require('./../users').UserDAO;
var DatabaseModel = require('./../database_model.js').dbObject;

var connectionString = "postgres://localhost:5432/startupinacar";

var start = exports.start = function start(port, callback){
  server = app.listen(port, callback);
};

var stop = exports.stop = function stop(callback){
  server.close(callback);
};

function requireLogin(req, res, next){
  if (!req.user){
    res.redirect('/login');
  } else {
    next();
  }
}

/* GET home page. */
var dbAccess = new DbDAO();

router.get('/', function(req, res) {
  dbAccess.getChallenges('', function(challengeItems){
    if (req.session && req.session.user){
      console.log("Hello from inside req.session && req.session.user");
      dbAccess.getSolved(req.session.user.user_id, function(solvedArray){
        var newArr = [];
        solvedArray.forEach(function(element, index, array){
          newArr.push(element.challenge_id);
        });

        console.log("newArr is: ", newArr);
        res.render('index', {
          title: 'Code Challenges',
          challenges: challengeItems,
          solvedArray: newArr
        });
      });
    } else { 
      console.log("Rendering WITHOUT the solvedIds");
      res.render('index', {
        title: 'Code Challenges',
        challenges: challengeItems,
        solvedArray: []
      });// res.render
    }; //dbAccess
  });
});

router.get('/addChallenge', function(req, res) {
  dbAccess.getChallenges('', function(challengeItems){
    if (req.session && req.session.user){
      console.log("Hello from inside req.session && req.session.user");
    }; 
    console.log("Rendering WITHOUT the solvedIds");
    res.render('addChallenge', {
      title: 'Code Challenges',
      challenges: challengeItems
    });// res.render
  }); //dbAccess
});

module.exports = router;
