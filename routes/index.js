var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var server;
var router = express.Router();

var start = exports.start = function start(port, callback){
  server = app.listen(port, callback);
};

var stop = exports.stop = function stop(callback){
  server.close(callback);
};

MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
  console.log("successfully connected to MongoDB");

  /* GET home page. */
  router.get('/', function(req, res, next) {
    db.collection('challenges').find().toArray(function(err, docs){
      res.render('index', {
        title: 'Code Challenges',
        challenges: docs });
    });
    //console.log("test test ");
    //res.render('index', { title: 'Code Challenges' });
  });

  router.get("/challenge/:challengeId", function(req, res) {

    var challengeId = req.params.challengeId;

    var mongo = require('mongodb');
    var o_id = new mongo.ObjectID(challengeId);
    db.collection('challenges').find({'_id': o_id}).toArray(function(err, docs){
      res.render("challenge", {
        challenge: docs[0] 
      });
    });

  
  });

  router.get("/register", function(req, res) {
    res.render("register");
  });

  router.post("/register", function(req, res, next) {
    var UserManagement = require('user-management');
 
    var USERNAME = req.body.userName;
    var PASSWORD = req.body.password;
    var EXTRAS   = {
      email: req.body.email
    }
 
    var users = new UserManagement({'database': 'startupinacar' });
    users.load(function(err) {
      console.log('Checking if the user exists');
      users.userExists(USERNAME, function(err, exists) {
        if (exists) {
          console.log('  User already exists');
          users.close();
        } else {
          console.log('  User does not exist');
          console.log('Creating the user');
          users.createUser(USERNAME, PASSWORD, EXTRAS, function (err) {
            console.log('  User created');
            users.close();
          });
        }
      });
    });

    next();
  }, function(req, res){
    res.render("register");
  });


});

module.exports = router;