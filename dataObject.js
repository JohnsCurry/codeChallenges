var pg = require('pg');

var connectionString = "postgres://localhost:5432/startupinacar";

function DbDAO(database){
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
  };

  this.getSolved = function(userId, callback){
    pg.connect(connectionString, function(err, client, done){
      if (err){
        console.log(err);
        return console.log("error fetching client from pool");
      }
      client.query("SELECT challenge_id FROM user_challenges WHERE user_id = $1", [userId],      function(err, result){
        if (err){
          console.log("err: ", err);
          callback(err);
        } else {
          done();
          callback(result.rows);
        }
      });
    })
  }

  this.addChallenge = function(title, description, points, difficulty, outsideLink, callback){
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
          done();
          callback("good");
        }
      });
    });
  };
}

module.exports.DbDAO = DbDAO;
