var pg = require('pg');

var connectionString = "postgres://localhost:5432/startupinacar";

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var sessions = require('client-sessions');
var UserModel = require('./user_model.js');



//mongoose.connect('mongodb://localhost:27017/startupinacar');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;


function UserDAO(database){
  this.db = database;

  this.addUser = function(userName, password, email, callback){
    

    pg.connect(connectionString, function(err, client, done){
      if (err){
        console.log(err);
        return console.log("error fetching client from pool");//, err);
      }
      client.query("INSERT INTO users (first_name, password, email) VALUES ($1, $2, $3)", [userName, password, email], function(err, result){
        if (err){
          console.log("err: ", err);
          callback(err)
        } else {
          callback("good");
        }
      });
    });
  }

  this.login = function(email, passwordAttempt, callback){

    console.log("email: ", email, "passwordAttempt: ", passwordAttempt);

    pg.connect(connectionString, function(err, client, done){
      if (err){
        console.log(err);
        return console.log("error fetching client from pool");//, err);
      }
      client.query("SELECT * FROM users WHERE email = $1", [email], function(err, result){
        if (err){
          console.log("err: ", err);
          callback(err)
        } else {
          callback(result.rows[0]);
        }
      });
    });

    /*UserModel.findOne({email: email}, function(err, user){
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
    });*/
  }

}

module.exports.UserDAO = UserDAO;