const express = require("express"),
  morgan = require("morgan");

const app = express();

app.use(morgan("common"));

app.use(express.static("public"));

let topMovies = [
  {
    title: "The Pirates of Silicon Valley",
    director: "Martyn Burke"
  },
  {
    title: "The Imitation Game",
    director: "Morten Tyldum"
  },
  {
    title: "The Internship",
    director: "Shawn Levy"
  },
  {
    title: "The Social Network",
    director: "David Fincher"
  },
  {
    title: "Tron",
    director: "Steven Lisberger"
  },
  {
    title: "Hackers",
    director: "Iain Softley"
  },
  {
    title: "Antitrust",
    director: "Peter Howitt"
  },
  {
    title: "Jobs",
    director: "Joshua Michael Stern"
  },
  {
    title: "Ex Machina",
    director: "Alex Garland"
  },
  {
    title: "Her",
    director: "Spike Jonze"
  }
];

app.get("/", (req, res) => {
  res.send("Welcome to TechFlix!");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("This app is listening on port 8080.");
});
