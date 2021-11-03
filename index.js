const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());

let movies = [
  {
    movieID: 1,
    title: "The Pirates of Silicon Valley",
    director: "Martyn Burke"
  },
  {
    movieID: 2,
    title: "The Imitation Game",
    director: "Morten Tyldum"
  },
  {
    movieID: 3,
    title: "The Internship",
    director: "Shawn Levy"
  },
  {
    movieID: 4,
    title: "The Social Network",
    director: {
      name: "David Fincher",
      born: "1962",
      dead: null,
      bio:
        "David Fincher was born in Denver, Colorado, and raised in Marin County, California. When he was 18 years old he went to work at Korty Films. He also directed TV commercials for clients like Nike, Coca-Cola and Chanel and music videos for Madonna, The Rolling Stones, Michael Jackson, Aerosmith and many others."
    },
    genre: "1",
    image:
      "https://upload.wikimedia.org/wikipedia/en/8/8c/The_Social_Network_film_poster.png",

    description:
      "This biographical drama it portrays the founding of Facebook and the resulting lawsuits."
  },
  {
    movieID: 5,
    title: "Tron",
    director: "Steven Lisberger"
  },
  {
    movieID: 6,
    title: "Hackers",
    director: "Iain Softley"
  },
  {
    movieID: 7,
    title: "Antitrust",
    director: "Peter Howitt"
  },
  {
    movieID: 8,
    title: "Jobs",
    director: "Joshua Michael Stern"
  },
  {
    movieID: 9,
    title: "Ex Machina",
    director: "Alex Garland"
  },
  {
    movieID: 10,
    title: "Her",
    director: "Spike Jonze"
  }
];

let genres = [
  {
    genreID: 1,
    name: "biopic",
    description:
      "This biographical drama it portrays the founding of Facebook and the resulting lawsuits."
  },
  {
    genreID: 2,
    name: "comedy",
    description: null
  },
  {
    genreID: 3,
    name: "drama",
    description: null
  }
];

let users = [
  {
    userID: 1,
    name: "Jack Bauer",
    username: "actionLover",
    password: "badpw123",
    email: "actionLover@yahoo.com",
    birthday: "02.03.1963",
    favorites: []
  },
  {
    userID: 2,
    name: "Angela Merkel",
    username: "chancellor",
    password: "raute",
    email: "angie@germany.de",
    birthday: "17.07.1954",
    favorites: []
  }
];

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
