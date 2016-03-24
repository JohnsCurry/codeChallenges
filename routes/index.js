var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var server;
var router = express.Router();
var validator = require('express-validator');

var start = exports.start = function start(port, callback){
  server = app.listen(port, callback);
};

var stop = exports.stop = function stop(callback){
  server.close(callback);
};

app.use(router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());

router.use(bodyParser.urlencoded({ extended: false }));
//MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
router.use(validator({
  customValidators: {
    isNew: function (email){
      //console.log("email param: ", email);
     // var theCount = db.collection('users').find({'EXTRAS.email': email }).count();
     // console.log("This is the count: ", theCount);
     // return !db.collection('challenges').find({'EXTRAS.email': email }).count();
    }
  }
}));
router.use(cookieParser('secret'));
//router.use(session({cookie: { maxAge: 60000 }}));
//router.use(flash());

MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
  console.log("successfully connected to MongoDB");

  /* GET home page. */
  router.get('/', function(req, res, next) {
    //req.flash('test', 'it worked');
    db.collection('challenges').find().toArray(function(err, docs){
      res.render('index', {
        title: 'Code Challenges',
        challenges: docs });
    });
    //console.log("test test ");
    //res.render('index', { title: 'Code Challenges' });
  });

  router.get('/account', function(req, res, next) {
    res.render('account');
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

  router.get("/login", function(req, res) {
    res.render("login");
  });

  router.post("/register", function(req, res, next) {

    console.log("This is the req.body.email", req.body.email);

    req.checkBody('userName', "userName must not be empty").notEmpty();
    req.checkBody('email', "Email must not be empty").notEmpty();
    //req.checkBody('email', 'Email already exists!').isNew(req.body.email);
    req.checkBody('password', "Password must not be empty").notEmpty();

    var UserManagement = require('user-management');
 
    var USERNAME = req.body.userName;
    var PASSWORD = req.body.password;
    var EXTRAS   = {
      email: req.body.email
    }

     var errors = req.validationErrors();
    if (errors) {
      res.render('register', {errors: errors});
      return;
    } else {
      // normal processing here
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