var express = require('express');
var session = require('express-session'); //remove this when you figure out how to do it.
var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var csrf = require('csurf');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash'); // remove flash?
var app = express();
//var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var server;
var router = express.Router();
var validator = require('express-validator');
var ChallengeDAO = require('./../challenges').ChallengeDAO;
var UserDAO = require('./../users').UserDAO;
var UserModel = require('./../user_model.js');
var ChallengeModel = require('./../challenge_model.js');

mongoose.connect('mongodb://localhost:27017/startupinacar');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
/*var UserSchema = mongoose.Schema({
  id: ObjectId,
  userName: {type: String, required: true },
  email: {type: String, unique: true },
  password: {type: String, required: true},
  solvedChallenges: []
});*/
//var UserModel = mongoose.model('User', UserSchema);
/*
var User = mongoose.model('User', new Schema({
  id: ObjectId,
  userName: String,
  email: {type: String, unique: true },
  password: String,
  solvedChallenges: []
}));
*/
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

router.use(bodyParser.urlencoded({ extended: true }));
//MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
router.use(validator({
  customValidators: {
    isNew: function (email){
    }
  }
}));
router.use(cookieParser('secret'));

router.use(sessions({
  cookieName: 'session',
  secret: 'jasdlfkjwe939h23.hahv8v,oqjeijf',
  duration: 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

router.use(function(req, res, next){
  if (req.session && req.session.user){
    UserModel.findOne({email: req.session.user.email}, function(err, user){
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

//MongoClient.connect('mongodb://localhost:27017/startupinacar', function(err, db) {
//  console.log("successfully connected to MongoDB");

//var challengeModel = mongoose.model('challenge', challenge);

  /* GET home page. */
  var challenges = new ChallengeDAO();
  var users = new UserDAO();

  challenges.getChallenges(function(challengeItems){

    router.get('/', function(req, res) {
      res.render('index', {
        title: 'Code Challenges',
        challenges: challengeItems
      });
    });

  });

  router.get('/addChallenge', function(req, res, next) {
    res.render('addChallenge');
  });

  router.post('/addChallenge', function(req, res, next) {
    var itemTitle = req.body.title;
    var itemDescription = req.body.description;
    var itemPoints = req.body.points;
    var itemDifficulty = req.body.difficulty;
    var itemOutsideLink = req.body.outsideLink;

    challenges.addChallenge(itemTitle, itemDescription, itemPoints, itemDifficulty, itemOutsideLink, function(msg){
      if (msg === "error"){
        res.render('addChallenge');
      } else {
        res.redirect('/');
      }
    });
  });

  router.get('/account', requireLogin, function(req, res, next) {
    res.render('account');
  });

  router.get("/challenge/:challengeId", requireLogin, function(req, res) {

    var challengeId = req.params.challengeId;

    var isSolved = function(challengeId, callback){
      console.log("in the aggregation: ", challengeId);
      UserModel.aggregate([
    //var isSolved = User.aggregate([
        { $match: {"solvedChallenges": { "challenge": challengeId } } },
        { $project: {
          userName: 1 }
        }
      ],
      function(err, results){
        //console.log("this is the result: ", results);
        callback(err, results);
        //return results;
      });
    };

    isSolved(challengeId, function(err, results){
      if (err) {
        console.log("There was an error");
      } else {
        console.log("this is the result: ", results);
      }
    });

    //console.log("is solved is: ", isSolved(challengeId));

    var mongo = require('mongodb');
    var o_id = new mongo.ObjectID(challengeId);
    ChallengeModel.find({'_id': o_id}, function(err, docs) {
      //console.log(docs);
      res.render('challenge', {
        challenge: docs[0]
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
    
    /*users.login(req.body.email, req.body.password, function(msg, user){
      if (msg === "match") {

        //req.session.user = user;
        //res.redirect('account');
      } else {
        console.log("User param is this: ", user);
        res.render('login', {error: "Invalid Email or Password"});
      }
    });*/
    UserModel.findOne({email: req.body.email}, function(err, user){
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

    //console.log(req.body.userName);
    //var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    /*var user = new User({
      userName: req.body.userName,
      password: hash,
      email: req.body.email
    });
*//*
    user.save(function(err){
      if(err){
        var err = "Something bad happened!";
        if (err.code === 11000){
          var error = 'that email is already taken';
        }
        res.render('register', {error: error});
      } else {
        res.redirect('/');
      }
    }) */
  });

  router.post("/submitChallenge", function(req, res, next){
    console.log("request.body: ", req.body);
    console.log("req.user", req.user);
    User.findOne({email: req.user.email}, function(err, doc){
      doc.solvedChallenges.push(req.body);
      doc.save();
    });

    res.redirect("/");
  });


//});

module.exports = router;