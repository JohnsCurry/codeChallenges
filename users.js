

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var sessions = require('client-sessions');
var UserModel = require('./user_model.js');



//mongoose.connect('mongodb://localhost:27017/startupinacar');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
/*
var UserSchema = mongoose.Schema({
  id: ObjectId,
  userName: {type: String, required: true },
  email: {type: String, unique: true },
  password: {type: String, required: true},
  solvedChallenges: []
})*/

//var UserModel = mongoose.model('User', UserSchema);

function UserDAO(database){
  this.db = database;

  this.addUser = function(userName, password, email, callback){
    var User = new UserModel({
      userName: userName,
      password: password,
      email: email
    });

    User.save(function(err){
      if(err){
        var err = "Something bad happened!";
        if (err.code === 11000){
          var error = 'that email is already taken';
        }
        callback("error");
        //res.render('register', {error: error});
      } else {
        callback("good");
        //res.redirect('/');
      }
    })
  }

  this.login = function(email, passwordAttempt, callback){
    UserModel.findOne({email: email}, function(err, user){
      console.log("User from the users.js file", user);
      if(!user){
        console.log("!user");
        //res.render('login', {error: 'Invalid Email or Password'});
      } else {
        if (bcrypt.compareSync(passwordAttempt, user.password)){
          console.log("password match");
          //req.session.user = user; // set-cookie: session= {email, password, etc...} info stored in session
          //res.redirect('account');
          callback(user);//, user);
        } else {
          console.log("no match!");
          //res.render('login', {error: "Invalid Email or Password"});
        }
      }
    });
  }

}

module.exports.UserDAO = UserDAO;