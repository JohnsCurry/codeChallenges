var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var session = require('express-session'); //remove this when you figure out how to do it.
var flash = require('connect-flash'); // remove flash?
var validator = require('express-validator');
var sessions = require('client-sessions');

var routes = require('./routes/index');
var users = require('./routes/users');
var addChallenge = require('./routes/addChallenge');
var challenges   = require('./routes/challenge');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());

app.use('/', routes);
app.use('/', users);
//app.use('/users', users);
app.use('/', addChallenge);
app.use('/', challenges);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

router.use(bodyParser.urlencoded({ extended: true }));
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
    req.user = req.session.user;
    delete req.user.password;
    res.locals.user = req.user;
  } else {
    res.locals.user = '';
  }
  next();
});

function requireLogin(req, res, next){
  if (!req.user){
    res.redirect('/login');
  } else {
    next();
  }
}

/*app.use(function(req, res, next){
  if (req.session && req.session.user){
    //console.log("app.use find user.")
    //User.findOne({email: req.session.user.email}, function(err, user) {
    //  if (user) {
    //    req.user = user;
    //    delete req.user.password;
    //    req.session.user = user;
    //    req.locals.user = user;
    //  }
    //  next();
    });
  } else {
    next();
  }
});*/

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
