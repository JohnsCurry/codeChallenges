var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

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

module.exports = mongoose.model('Challenge', ChallengeSchema);