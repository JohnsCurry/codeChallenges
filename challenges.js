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

  this.getChallenges = function(callback){
    ChallengeModel.find({}, function (err, docs) {
      callback(docs);
    });
  }

  this.addChallenge = function(title, description, points, difficulty, outsideLink, callback){
    //router.post('/addChallenge', function(req, res, next) {

    var ChallengeDoc = new ChallengeModel({
      title: title,
      description: description,
      points: points,
      difficulty: difficulty,
      outsideLink: outsideLink
    });

    ChallengeDoc.save(function (err, challengeDoc){
      if (err) {
        for (var errProp in err.errors){
          console.log("err.errors." + errProp + ".message" + " ... " + err.errors[errProp]);
          console.log("This is the error", err.errors[errProp]);
          callback("error");
        }
        //res.render('addChallenge', {errors: err.errors});
      } else {
        console.log("everything is good");
        callback("good");
      }
    });
    //res.redirect('/');
  
  /*challengeDoc.save(function (err, challengeDoc){
      if (err) {
        for (var errProp in err.errors){
          console.log("err.errors." + errProp + ".message" + " ... " + err.errors[errProp]);
          //console.log("This is the error", err.errors[errProp]);
        }
        res.render('addChallenge', {errors: err.errors});
      } else {
        console.log("everything is good");
      }
    });*/
  };

  this.isSolved = function(){

  }
}

module.exports.ChallengeDAO = ChallengeDAO;