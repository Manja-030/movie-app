const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const { check, validationResult } = require("express-validator");

const app = express();

const passport = require("passport");
app.use(passport.initialize());
require("./passport");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

require("dotenv").config();

let auth = require("./auth")(app);

//Integrating mongoose:
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

//To connect to local database (e.g. for testing purpose):
/*mongoose.connect("mongodb://localhost:27017/techFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});*/

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// landing page
app.get("/", (req, res) => {
  res.send("Welcome to TechFlix!");
});

// Add user:
app.post(
  "/users",
  [
    check("Username", "Username is required.")
      .not()
      .isEmpty(),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required.")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then(user => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(user => {
              res.status(201).json(user);
            })
            .catch(error => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Remove user (by username):

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send("User " + req.params.Username + " was deleted.");
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Update user info (by username):
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required.")
      .not()
      .isEmpty(),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required.")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail()
  ],
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      {
        new: true
      },
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.send("User profile was updated: " + updatedUser);
        }
      }
    );
  }
);

// Get data about all movies:
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then(movies => {
        res.status(201).json(movies);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
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
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then(movie => {
        res.json(movie);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get data about a genre by its name:
app.get(
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
);

app.get(
  "/genres/:id",
  //passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.params.Name);
    Genres.findOne({ id: ObjectID("req.params.Name") })
      .then(genre => {
        res.json(genre);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
        console.log(req.params.Name);
      });
  }
);

// Get data about a director by name:
app.get(
  "/movies/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then(movies => {
        res.json(movies.Director);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Add movie to list of favourites:
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $addToSet: { FavMovies: req.params.MovieID } },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Remove movie from list of favourites:
app.delete(
  "/users/:Username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavMovies: req.params.MovieID } },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("This app is listening on Port " + port);
});
