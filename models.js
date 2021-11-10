const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  Title: { type: String, requiered: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: { type: String, requiered: true },
  Password: { type: String, requiered: true },
  Email: { type: String, requiered: true },
  Birthay: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: "Movie" }]
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
