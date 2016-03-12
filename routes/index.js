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

    var challengeId = parseInt(req.params.challengeId);
    
    res.render("challenge");
  });
});

module.exports = router;