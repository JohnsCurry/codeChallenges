var express = require('express');
var session = require('express-session'); //remove this when you figure out how to do it.
var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash'); // remove flash?
var app = express();
//var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var server;
var router = express.Router();
var validator = require('express-validator');

mongoose.connect('mongodb://localhost:27017/startupinacar');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var challenge = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    unique: [true, "Title must be unique"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  difficulty: String,
  points: Number,
  outsideLink: String
});

var User = mongoose.model('User', new Schema({
  id: ObjectId,
  userName: String,
  email: {type: String, unique: true },
  password: String,
}));

/*
var user = new Schema({
  username: String,
  password: String,
  passwordSalt: String,
  extras: {
    email: String
  }
});
*/

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
router.use(csrf());

router.use(bodyParser.urlencoded({ extended: true }));
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

router.use(sessions({
  cookieName: 'session',
  secret: 'jasdlfkjwe939h23.hahv8v,oqjeijf',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

router.use(function(req, res, next){
  if (req.session && req.session.user){
    User.findOne({email: req.session.user.email}, function(err, user){
      if (user) {
        req.user = user;
        delete req.user.password;
        req.session.user = user;
        res.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});

function requireLogin(req, res, next){
  if (!req.user){
    res.redirect('/login');
  } else {
    next();
  }
}

app.use(function(req, res, next){
  if (req.session && req.session.user){
    User.findOne({email: req.session.user.email}, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password;
        req.session.user = user;
        req.locals.user = user;
      }
      next();
    });
  } else {
    next();
  }
});
//router.use(session({cookie: { maxAge: 60000 }}));
//router.use(flash());

//MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
//  console.log("successfully connected to MongoDB");

var challengeModel = mongoose.model('challenge', challenge);
//var userModel      = mongoose.model('user', user);

  /* GET home page. */
  router.get('/', function(req, res, next) {
    //req.flash('test', 'it worked');
    challengeModel.find({}, function (err, docs) {
      res.render('index', {
        title: 'Code Challenges',
        challenges: docs });
    });
  });

  router.get('/addChallenge', function(req, res, next) {
    res.render('addChallenge');
  });

  router.post('/addChallenge', function(req, res, next) {

    var challengeDoc = new challengeModel({
      title: req.body.title,
      description: req.body.description,
      points: req.body.points,
      difficulty: req.body.difficulty,
      outsideLink: req.body.outsideLink
    });

    challengeDoc.save(function (err, challengeDoc){
      if (err) {
        for (var errProp in err.errors){
          console.log("err.errors." + errProp + ".message" + " ... " + err.errors[errProp]);
          //console.log("This is the error", err.errors[errProp]);
        }
        res.render('addChallenge', {errors: err.errors});
      } else {
        console.log("everything is good");
      }
    });
    //res.redirect('/');
  });

  router.get('/account', requireLogin, function(req, res, next) {
    res.render('account');
  });

  router.get("/challenge/:challengeId", function(req, res) {

    var challengeId = req.params.challengeId;

    var mongo = require('mongodb');
    var o_id = new mongo.ObjectID(challengeId);
    challengeModel.find({'_id': o_id}, function(err, docs) {
      console.log(docs);
      res.render('challenge', {
        challenge: docs[0]
      });
    });
  
  });

  router.get("/register", function(req, res) {
    res.render("register", { csrfToken: req.csrfToken() });
  });

  router.get('/logout', function(req, res){
    req.session.reset();
    res.redirect('/');
  })

  router.get("/login", function(req, res) {
    res.render("login", { csrfToken: req.csrfToken() });
  });

  router.post('/login', function(req, res){
    console.log('test1');
    User.findOne({email: req.body.email}, function(err, user){
      if(!user){
        console.log("!user");
        res.render('login', {error: 'Invalid Email or Password'});
      } else {
        console.log("else user...");
        if (bcrypt.compareSync(req.body.password, user.password)){
          console.log("password match");
          req.session.user = user; // set-cookie: session= {email, password, etc...} info stored in session
          res.redirect('account');
        } else {
          console.log("no match!");
          res.render('login', {error: "Invalid Email or Password"});
        }
      }
    });
  });

  router.post("/register", function(req, res, next) {
    console.log(req.body.userName);
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    var user = new User({
      userName: req.body.userName,
      password: hash,
      email: req.body.email
    });

    user.save(function(err){
      if(err){
        var err = "Something bad happened!";
        if (err.code === 11000){
          error = 'that email is already taken';
        }
        res.render('register', {error: error});
      } else {
        res.redirect('/');
      }
    })

    //console.log("This is the req.body.email", req.body.email);

    //req.checkBody('userName', "userName must not be empty").notEmpty();
    //req.checkBody('email', "Email must not be empty").notEmpty();
    //req.checkBody('email', 'Email already exists!').isNew(req.body.email);
    //req.checkBody('password', "Password must not be empty").notEmpty();

    //var UserManagement = require('user-management');
 
    //var USERNAME = req.body.userName;
    //var PASSWORD = req.body.password;
    //var EXTRAS   = {
    //  email: req.body.email
    //}

    // var errors = req.validationErrors();
    //if (errors) {
    //  res.render('register', {errors: errors});
    //  return;
    //} else {
      // normal processing here
    //}
 
    //var users = new UserManagement({'database': 'startupinacar' });
    //users.load(function(err) {
    //  console.log('Checking if the user exists');
    //  users.userExists(USERNAME, function(err, exists) {
     //   if (exists) {
     //     console.log('  User already exists');
     //     users.close();
     //   } else {
      //    console.log('  User does not exist');
      //    console.log('Creating the user');
      //    users.createUser(USERNAME, PASSWORD, EXTRAS, function (err) {
      //      console.log('  User created');
      //      users.close();
      //    });
      //  }
      //});
    //});

    //next();
  //}, function(req, res){
  //  res.render("register");
  });


//});

module.exports = router;