const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	genre: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Genre' }],
	director: {
		name: String,
		bio: String,
		birth: String,
		death: String,
	},
	actors: [String],
	imagePath: String,
	featured: Boolean,
});

let genreSchema = mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
});

let userSchema = mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true },
	birthday: Date,
	favMovies: [{ type: mongoose.Schema.Types.ObjectID, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
	return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
	return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
