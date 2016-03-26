var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var UserSchema = mongoose.Schema({
  id: ObjectId,
  userName: {type: String, required: true },
  email: {type: String, unique: true },
  password: {type: String, required: true},
  solvedChallenges: []
});

module.exports = mongoose.model('User', UserSchema);