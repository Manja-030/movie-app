const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const { check, validationResult } = require('express-validator');

const app = express();

const passport = require('passport');
app.use(passport.initialize());
require('./passport');

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

require('dotenv').config();

let auth = require('./auth')(app);

//Integrating mongoose:
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

//To connect to local database (e.g. for testing purpose):
mongoose.connect('mongodb://localhost:27017/techFlixDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}); /*

//To connect to API on Heroku:
mongoose.connect(process.env.CONNECTION_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});*/

// landing page
app.get('/', (req, res) => {
	res.send('Welcome to TechFlix!');
});

// Add user:
app.post(
	'/users',
	[
		check('username', 'Username is required.').not().isEmpty(),
		check('username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
		check('password', 'Password is required.').not().isEmpty(),
		check('email', 'Email does not appear to be valid.').isEmail(),
	],
	(req, res) => {
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		let hashedPassword = Users.hashPassword(req.body.password);
		Users.findOne({ username: req.body.username })
			.then((user) => {
				if (user) {
					return res.status(400).send(req.body.username + ' already exists');
				} else {
					Users.create({
						username: req.body.username,
						password: hashedPassword,
						email: req.body.email,
						birthday: req.body.birthday,
					})
						.then((user) => {
							res.status(201).json(user);
						})
						.catch((error) => {
							console.error(error);
							res.status(500).send('Error: ' + error);
						});
				}
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

// Remove user (by username):

app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({ username: req.params.username })
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.username + ' was not found.');
			} else {
				res.status(200).send('User ' + req.params.username + ' was deleted.');
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Update user info (by username):
app.put(
	'/users/:username',
	passport.authenticate('jwt', { session: false }),
	[
		check('username', 'Username is required.').not().isEmpty(),
		check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
		check('password', 'Password is required.').not().isEmpty(),
		check('email', 'Email does not appear to be valid.').isEmail(),
	],
	(req, res) => {
		Users.findOneAndUpdate(
			{ username: req.params.username },
			{
				$set: {
					username: req.body.username,
					password: req.body.password,
					email: req.body.email,
					birthday: req.body.birthday,
				},
			},
			{
				new: true,
			},
			(error, updatedUser) => {
				if (error) {
					console.error(error);
					res.status(500).send('Error: ' + error);
				} else {
					res.send('User profile was updated: ' + updatedUser);
				}
			}
		);
	}
);

// Get data about all movies:
app.get(
	'/movies',
	//passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Movies.find()
			.then((movies) => {
				res.status(201).json(movies);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

/*For testing purposes:
app.get('/movies', function (req, res) {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});
*/

//Get data about a single movie:
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ title: req.params.title })
		.then((movie) => {
			res.json(movie);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// get data about all genres

app.get(
	'/genres',
	//passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Genres.find()
			.then((genres) => {
				res.status(201).json(genres);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

// Get data about a genre by its name:
{
	/*app.get(
  "/genres/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Genres.findOne({ Name: req.params.Name })
      .then(genre => {
        res.json(genre);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);*/
}
//get data about genre by id:
/*app.get(
	'/genres/:id',
	//passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Genres.findOne({ _id: req.params.id })
			.then((genre) => {
				console.log(req.params);
				res.json(genre);
			})
			.catch((error) => {
				console.trace(error);
				res.status(500).send('Error: ' + error);
			});
	}
);*/
app.get(
	'/genres/:id',
	//passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		try {
			const genre = await Genres.findOne({ _id: req.params.id });
			res.status(200).json({ data: genre });
		} catch {
			res.status(500).json('Error:', +error);
		}
	}
);

// Get data about a director by name:
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ 'director.name': req.params.name })
		.then((movies) => {
			res.json(movies.director);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Add movie to list of favorites:
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ username: req.params.username },
		{ $addToSet: { favMovies: req.params.movieId } },
		{ new: true },
		(error, updatedUser) => {
			if (error) {
				console.error(error);
				res.status(500).send('Error: ' + error);
			} else {
				res.json(updatedUser);
			}
		}
	);
});

// Remove movie from list of favorites:
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ username: req.params.username },
		{ $pull: { favMovies: req.params.movieId } },
		{ new: true },
		(error, updatedUser) => {
			if (error) {
				console.error(error);
				res.status(500).send('Error: ' + error);
			} else {
				res.json(updatedUser);
			}
		}
	);
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('This app is listening on Port ' + port);
});
