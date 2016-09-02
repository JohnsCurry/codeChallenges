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
//var ChallengeDAO = require('./../challenges').ChallengeDAO;
var UserDAO = require('./../users').UserDAO;
//var UserModel = require('./../user_model.js');
//var ChallengeModel = require('./../challenge_model.js');
//

//This iframeObject should probably be refactored to not be a global object. Unless... It's not a global object?
var iframeObject = {};

var connectionString = "postgres://localhost:5432/startupinacar";

function requireLogin(req, res, next){
  if (!req.user){
    res.redirect('/login');
  } else {
    next();
  }
}

router.get('/iframe/:challengeId', requireLogin, function(req, res){
  var challengeId = req.params.challengeId;
  var testVar = "test variable 1";
  res.render('iframe', {
    testId: challengeId,
    iframeObject: iframeObject
  });
});

router.post('/iframe', function(req, res, next){
  iframeObject.htmlValue = req.body.htmlValue;
  iframeObject.jsValue = req.body.jsValue;
  res.send(iframeObject);
  //next();
});

router.get("/challenge/:challengeId", requireLogin, function(req, res) {
  //var checkedValue;

  var challengeId = req.params.challengeId;

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      console.log(err);
      return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
    }
    //SELECT challenges.title, challenges.description, challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = 4;
    client.query("SELECT * FROM challenges WHERE challenge_id = $1;", [challengeId], function(err, result){
      done();

      if(err) {
        return console.log('error running query');//, err);
      } else {
        client.query("SELECT * FROM user_challenges WHERE user_id = $1 AND challenge_id = $2", [req.session.user.user_id, challengeId], function(err, isSolved){
          var solvedBool;
          if (isSolved.rows.length === 0){
            solvedBool = false;
          } else {
            solvedBool = true;
          }
          res.render('challenge', {
            challenge: result.rows[0],
            solvedBool: solvedBool
          });
        });
      }
    });
  });

});

router.post("/completeChallenge", function(req, res, next){

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      console.log(err);
      return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
    }
    client.query("INSERT INTO user_challenges (user_id, challenge_id) VALUES ($1, $2)", [req.session.user.user_id, req.body.challenge], function(err, result){
      done();

      if(err) {
        return console.log('error running query');//, err);
      } else {
        res.render('/');
      }
    });
  });

  res.redirect("/");
});

router.post("/unSolve", function(req, res, next){

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      console.log(err);
      return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
    }
    client.query("DELETE FROM user_challenges WHERE user_id = $1 AND challenge_id = $2 ", [req.session.user.user_id, req.body.challenge], function(err, result){
      done();

      if(err) {
        return console.log('error running query');//, err);
      } else {
        res.render('/');
      }
    });
  });

  res.redirect("/");
});


module.exports = router;
