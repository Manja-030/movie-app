const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to TechFlix!");
});

// Add user:
app.post("/users", (req, res) => {
  let newUser = req.body;
  if (!newUser.name) {
    const message = "Missing user name in request body.";
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

// Remove user (by username):
app.delete("/users/:username", (req, res) => {
  let user = users.find(user => {
    return user.username === req.params.username;
  });
  if (user) {
    users = users.filter(obj => {
      return obj.username !== req.params.username;
    });
    res.status(201).send("User " + req.params.username + " was nuked.");
  }
});

// Update user info (by username):
app.put("/users/:username/:InfoToUpdate", (req, res) => {
  res.send("Successful PUT to update user information.");
});

// Get data about all movies:
app.get("/movies", (req, res) => {
  res.json(movies);
});

//Get data about a single movie:
app.get("/movies/:title", (req, res) => {
  res.json(
    movies.find(movie => {
      return movie.title === req.params.title;
    })
  );
});

// Get data about a genre by its name:
app.get("/movies/genres/:name", (req, res) => {
  res.json(
    genres.find(genre => {
      return genre.name === req.params.name;
    })
  );
});

// Get data about a director by name:
app.get("/movies/director/:name", (req, res) => {
  res.json("Successful GET request returning data about director.");
});

// Add movie to list of favorites:
app.post("/users/:username/favorites/:movieId", (req, res) => {
  res.send("Successful POST to add movie to favorites list");
});

// Remove movie from list of favorites:
app.delete("/users/:username/favorites/:movieID", (req, res) => {
  res.send("Successful DELETE to remove movie from favorites list");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("This app is listening on port 8080.");
});
