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

var connectionString = "postgres://localhost:5432/startupinacar";

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

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
  console.log("In router.use thing");
  if (req.session && req.session.user){
    req.user = req.session.user;
    delete req.user.password;
    res.locals.user = req.user;
  }
    //pg.connect(connectionString, function(err, client, done){
      //    req.user = result.rows[0];
      //    delete req.user.password;
      //    req.session.user = result.rows[0];
      //    res.locals.user = result.rows[0];
      //  }
      //});
    //});
    //UserModel.findOne({email: req.session.user.email}, function(err, user){
    //  if (user) {
    //    req.session.user = user;
    //    res.locals.user = user;
    //  }
    //  next();
    //});
//  } else {
    next();
//  }
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

  challenges.getChallenges('', function(challengeItems){

    router.get('/', function(req, res) {

      if (req.session && req.session.user){
        console.log("I am here");
        pg.connect(connectionString, function(err, client, done) {
          console.log("made it into pg.connect");
          if (err) {
            console.log(err);
            return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
          } //if err
          //SELECT challenges.title, challenges.description, challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = 4;
          client.query("SELECT challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = $1;", [req.session.user.user_id], function(err, result){
            //console.log("hi from inside query");
            done();
            console.log("These are the rows", result.rows);
            var challengeIds = [];
            for (var i = 0; i < result.rows.length; i++){
              challengeIds.push(result.rows[i].challenge_id);
            }
            //console.log("challengeitems: ", challengeItems);
            console.log("Rendering WITH WITH WITH the solved IDS");
            res.render('index', {
              title: 'Code Challenges',
              challenges: challengeItems,
              solvedIds: challengeIds
            });// res.render
            //var challengeIdString = challengeIds.join(", ");
            //console.log("ChallengeIdString: ", challengeIdString);
            //console.log("Where created: ", challengeIds);

            if(err) {
              return console.log('error running query');//, err);
            } else {
              //console.log("These are passed to account: ", result.rows);
              //res.render('account', {solvedChallenges: result.rows});
            } //if (err) else {}
          }); //client.query()
        }); // pg.connect
      }; // if (req.session && req.session.user)
      //console.log("ChallengeIdString: ", challengeIdString);
      console.log("Rendering WITHOUT the solvedIds");
      res.render('index', {
        title: 'Code Challenges',
        challenges: challengeItems
      });// res.render
    }); //router.get

  }); //challenges.getChallenges

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
    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        console.log(err);
        return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
      }
      //SELECT challenges.title, challenges.description, challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = 4;
      client.query("SELECT challenges.title, challenges.challenge_id, challenges.difficulty FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = 4;", function(err, result){
        done();

        if(err) {
          return console.log('error running query');//, err);
        } else {
          console.log("These are passed to account: ", result.rows);
          res.render('account', {solvedChallenges: result.rows});
        }
      });
    });
    //res.render('account');
  });

  router.get("/challenge/:challengeId", requireLogin, function(req, res) {
    //var checkedValue;

    var challengeId = req.params.challengeId;
    console.log(req.params);

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

  router.post("/submitChallenge", function(req, res, next){
    //console.log("request.body: ", req.body);
    //var query = {_id: req.body.challenge};
    //console.log("query is: ", query);

    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        console.log(err);
        return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
      }
      //SELECT challenges.title, challenges.description, challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = 4;
      client.query("INSERT INTO user_challenges (user_id, challenge_id) VALUES ($1, $2)", [req.session.user.user_id, req.body.challenge], function(err, result){
        done();

        if(err) {
          return console.log('error running query');//, err);
        } else {
          res.render('/');
        }
      });
    });

    //challenges.getChallenges(query, function(challengeItem){
      //console.log("in index.js challengeItem: ", challengeItem);
      //UserModel.findOne({email: req.user.email}, function(err, doc){
      //  doc.solvedChallenges.addToSet(challengeItem);
      //  doc.save();
      //});
    //});
    //console.log("req.user", req.user);

    res.redirect("/");
  });


//});

module.exports = router;