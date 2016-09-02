var pg = require('pg');

var connectionString = "postgres://localhost:5432/startupinacar";

var bcrypt = require('bcryptjs');
var sessions = require('client-sessions');


function UserDAO(){

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

  }

}

module.exports.UserDAO = UserDAO;
