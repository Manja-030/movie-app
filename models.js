const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * movieSchema
 * @constructor movieSchema
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Genre' }],
  Director: {
    Name: String,
    Bio: String,
    Birth: String,
    Death: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
 * userSchema
 * @constructor genreSchema
 */
let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true },
});

/**
 * userSchema
 * @constructor userSchema
 */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Movie' }],
});

/** @function
 * @name hashPassword
 * @description Generate hash for the password
 * @param {string} password
 * @param {number} - Hashing
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/** @function
 * @name validatePassword
 * @description Compare stored hashed password with password entered on client side
 * @param {string} password
 * @returns {string } password, this.password - comparison of received passwords
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
