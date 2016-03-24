var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var app = express();
var router = express.Router();

app.use(router);
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());

router.use(cookieParser('secret'));
router.use(session({cookie: { maxAge: 60000 }}));
router.use(flash());

router.get('/', function(req, res){
  req.flash('test', 'it worked');
  res.redirect('/test')
  //res.send("hello there");
});

router.all('/test', function(req, res){
  res.send(JSON.stringify(req.flash('test')));
});

//app.listen(3000);

module.exports = app;