const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());

//Integrating mongoose:
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/techFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// landing page
app.get("/", (req, res) => {
  res.send("Welcome to TechFlix!");
});

// Add user:
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then(user => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});

// Remove user (by username):

app.delete("/users/:Username", (req, res) => {
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
});

// Update user info (by username):
app.put("/users/:Username", (req, res) => {
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
});

// Get data about all movies:
app.get("/movies", (req, res) => {
  Movies.find()
    .then(movies => {
      res.status(201).json(movies);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//Get data about a single movie:
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then(movie => {
      res.json(movie);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get data about a genre by its name:
app.get("/genres/:Name", (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then(genre => {
      res.json(genre);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get data about a director by name:
app.get("/movies/director/:Name", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then(movies => {
      res.json(movies.Director);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Add movie to list of favourites: !!! NOT WORKING YET !!!
app.post("/users/:Username/movies/:MovieID", (req, res) => {
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
});

// Remove movie from list of favourites: NOT WORKING YET!!!
app.delete("/users/:Username/Movies/:MovieID", (req, res) => {
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
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("This app is listening on port 8080.");
});
