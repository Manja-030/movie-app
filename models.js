const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  Title: { type: String, requiered: true },
  Description: { type: String, required: true },
  Genre: [{ type: mongoose.Schema.Types.ObjectID, ref: "Genre" }],
  Director: {
    Name: String,
    Bio: String,
    Birth: String,
    Death: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

let userSchema = mongoose.Schema({
  Username: { type: String, requiered: true },
  Password: { type: String, requiered: true },
  Email: { type: String, requiered: true },
  Birthay: Date,
  FavMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: "Movie" }]
});

let Movie = mongoose.model("Movie", movieSchema);
let Genre = mongoose.model("Genre", genreSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
