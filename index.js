// Load express framework
const express = require('express');
const app = express();

// Import middleware libraries: Morgan, bodyparser, uuid:
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// Import express-validator to validate input fields
const { check, validationResult } = require('express-validator');

const passport = require('passport');
app.use(passport.initialize());
require('./passport');

// Execute Middleware functions:

app.use(morgan('common')); // creates request logs in the console
app.use(express.static('public')); // serves a static page of all files in public folder
app.use(bodyParser.json()); // parses the request body
app.use(bodyParser.urlencoded({ extended: true }));

// Import and use CORS
const cors = require('cors');
app.use(cors());

require('dotenv').config();

let auth = require('./auth')(app);

// Integrate Mongoose and the models defined in models.js:
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

/* Connect to database
 * a connect to local database - e.g. for testing purpose
 * b connect to Heroku hosted database
 */

/* a
mongoose.connect('mongodb://localhost:27017/techFlixDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
*/

/* b
 */
mongoose.connect(
  process.env.CONNECTION_URI || 'mongodb://localhost:27017/techFlixDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

/* ***** ENDPOINT DEFINITION STARTS HERRE *****
 ***********************************************
 */

/**
 * Route to landing page serving welcome text.
 * Endpoint: /
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {string} - Welcome message to the user
 */
app.get('/', (req, res) => {
  res.send('Welcome to TechFlix!');
});

/* --- USER Endpoints --- */

/**
 * Route adding new user to database.
 * Username, Password, Email are required fields.
 * Endpoint: /users
 * @method POST
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - user
 */
app.post(
  '/users',
  [
    check('Username', 'Username is required.').not().isEmpty(),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed'
    ).isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password); // create hashed password from given password
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          // if this username already exists, throw error
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          // if there is not such username yet, create new user with given parameters from request body
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword, // store only hashed password
            Email: req.body.Email,
            Birthday: req.body.Birthday,
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

/**
 * Route deleting user from database
 * Endpoint: /users/:Username
 * @method DELETE
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {string} - message of success
 */
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.');
        } else {
          res.status(200).send('User ' + req.params.Username + ' was deleted.');
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * Route serving JSON of one user.
 * Endpoint: /users/:Username
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - one user
 */
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        //if a user with that name is found, return user info
        res.status(201).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
      });
  }
);

/**
 * Route updating user profile of specific user
 * Endpoint: /users/:Username
 * @method PUT
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - user data
 */
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    // validation:
    check('Username', 'Username is required.').not().isEmpty(),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          // info from request body that can be updated
          Username: req.body.Username,
          Password: req.body.Password, // store only hashed password
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      {
        new: true, // return the updated document
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

/**
 * Route adding a movie to the user's list of favorites
 * Endpoint: /users/:Username/movies/:MovieID
 * @method POST
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - updated user
 */
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $addToSet: { FavMovies: req.params.MovieID } },
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
  }
);

/**
 * Route deleting movie from list of favorites
 * Endpoint: /users/:Username/movies/:MovieID
 * @method DELETE
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - updated user
 */
app.delete(
  '/users/:Username/Movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username }, // find user by username
      { $pull: { FavMovies: req.params.MovieID } }, // remove movie from list
      { new: true }, // return updated document
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error: ' + error);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/* --- MOVIE Endpoints --- */

/**
 * Route serving JSON of one movie.
 * Endpoint: /movies/:id
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - one movie
 */
app.get(
  '/movies/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('hello');
    Movies.findOne({ _id: req.params.id }) // find movie by id
      // if movie was found, return json, else throw error
      .then((movie) => {
        res.json(movie);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/**
 * Route serving JSON of all movies.
 * Endpoint /movies
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - All movies
 */
app.get(
  '/movies/',
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

/**
 * Route serving JSON of one director.
 * Endpoint /movies/director/:Name
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - one director
 */
app.get(
  '/movies/director/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movies) => {
        res.json(movies.Director);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

/* --- GENRE Endpoints --- */

// route serving data about all genres
/**
 * Route serving JSON of all genres
 * Endpoint:  /genres
 * @method GET
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - genres
 */

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

/**
 * Route serving JSON of one genre
 * Endpoint: get/genres/:id
 * @method GET
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @returns {JSON} - genre information
 */
app.get(
  '/genres/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Genres.findOne({ id: req.params.id })
      .then((genre) => {
        console.log(genre);
        res.json(genre);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
        console.log(req.params);
      });
  }
);

/* --- For testing purpose only - will be deleted --- */

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
/*app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);*/

/**
 * Default error handleing
 * @module errorHandling
 * @param {Object} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('This app is listening on Port ' + port);
});
