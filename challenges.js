var pg = require('pg');

var connectionString = "postgres://localhost:5432/startupinacar";



var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/startupinacar');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var ChallengeModel = require('./challenge_model.js');
var ChallengeSchema = mongoose.Schema({
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

//var ChallengeModel = mongoose.model('Challenge', ChallengeSchema);

function ChallengeDAO(database){
  this.db = database;

  this.getChallenges = function(query, callback){
    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        console.log(err);
        return console.log("error fetching client from pool", err);//res.status(500).json({ success: false, data: err});
      }
      client.query("SELECT * FROM challenges;", function(err, result){
        done();

        if(err) {
          return console.log('error running query');//, err);
        }
          callback(result.rows);
      });
    });
  }

  this.getSolvedChallenges = function(callback){
    ChallengeModel.find({}, function(err, docs){
      callback(docs);
    });
  }

  this.addChallenge = function(title, description, points, difficulty, outsideLink, callback){
    //router.post('/addChallenge', function(req, res, next) {
    pg.connect(connectionString, function(err, client, done){
      if (err){
        console.log(err);
        return console.log("error fetching client from pool");//, err);
      }
      client.query("INSERT INTO challenges (title, description, points, difficulty, outsideLink) VALUES ($1, $2, $3, $4, $5)", [title, description, points, difficulty, outsideLink], function(err, result){
        if (err){
          console.log("err: ", err);
          callback(err)
        } else {
          callback("good");
        }
      });
    });
  };

  this.isSolved = function(){

  }
}

module.exports.ChallengeDAO = ChallengeDAO;