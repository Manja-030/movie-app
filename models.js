const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  Birthday: Date,
  FavMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: "Movie" }]
});

userSchema.statics.hashPassword = password => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let Genre = mongoose.model("Genre", genreSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
