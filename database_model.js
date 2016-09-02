var pg = require('pg');
var connectionString = "postgres://localhost:5432/startupinacar";


function dbObject(){
  pg.connect(connectionString, function(err, client, done) {
    console.log("made it into pg.connect");
    if (err) {
      console.log(err);
      return console.log("error fetching client from pool", err);
    } //if err


    this.getChallenges = function(query, callback){
      client.query("SELECT * FROM challenges;", function(err, result){
        done();
        if(err) {
          return console.log('error running query');//, err);
        }
        callback(result.rows);
      });
    }


    this.addChallenge = function(title, description, points, difficulty, outsideLink, callback){
      client.query("INSERT INTO challenges (title, description, points, difficulty, outsideLink) VALUES ($1, $2, $3, $4, $5)", [title, description, points, difficulty, outsideLink], function(err, result){
        if (err){
          console.log("err: ", err);
          callback(err)
        } else {
          done();
          callback("good");
        }
      });
    };
  }); // pg.connect
}


module.exports.dbObject = dbObject;

  //client.query("SELECT challenges.challenge_id FROM user_challenges INNER JOIN challenges ON user_challenges.challenge_id = challenges.challenge_id WHERE user_id = $1;", [req.session.user.user_id], function(err, result){


/*client.query("SELECT * FROM challenges",  function(err, result){
  done();
  console.log("These are the rows", result.rows);
  if(err) {
    return console.log('error running query');//, err);
  }
}); //client.query()*/
