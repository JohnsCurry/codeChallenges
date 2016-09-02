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
var ChallengeDAO = require('./../dataObject.js').ChallengeDAO;
var UserDAO = require('./../users').UserDAO;

var connectionString = "postgres://localhost:5432/startupinacar";

function requireLogin(req, res, next){
  if (!req.user){
    res.redirect('/login');
  } else {
    next();
  }
}

var users = new UserDAO();

router.get('/account', requireLogin, function(req, res, next) {
    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        console.log(err);
        return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
      }
      client.query("SELECT challenges.title, challenges.challenge_id, challenges.difficulty FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = $1;", [req.session.user.user_id], function(err, result){
        done();
        if(err) {
          return console.log('error running query');//, err);
        } else {
          console.log("These are passed to account: ", result.rows);
          res.render('account', {solvedChallenges: result.rows});
        }
      });
    });
  });

  router.get("/register", function(req, res) {
    res.render("register"/*, { csrfToken: req.csrfToken() }*/);
  });

  router.get('/logout', function(req, res){
    req.session.reset();
    res.redirect('/');
  })

  router.get("/login", function(req, res) {
    res.render("login"/*, { csrfToken: req.csrfToken() }*/);
  });

  router.post('/login', function(req, res){
    
    users.login(req.body.email, req.body.password, function(user){
      if (bcrypt.compareSync(req.body.password, user.password)){
        req.session.user = user;
        res.redirect('account');
      } else {
        console.log("password did not match");
        res.render('login', {error: "You entered an invalid email or password"});
      }
    });
  });

  router.post("/register", function(req, res, next) {
    var userName = req.body.userName;
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var email = req.body.email;

    users.addUser(userName, hash, email, function(msg){
      if (msg === "good") {
        res.redirect('/');
      } else {
        res.render('register', {error: "error"});
      }
    });
  });

module.exports = router;
