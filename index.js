const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let top10movies = [{
  "#1":"The Rescue",
  "#2":"Raya",
  "#3":"Frozen",
  "#4":"Frozen II",
  "#5":"Little Mermaid",
  "#6":"Karate Kid",
  "#7":"Secretly, Greatly",
  "#8":"ShangChi",
  "#9":"Spider-Man: No Way Home",
  "#10":"Avengers: Endgame",
}];


app.get("/movies", (req, res) => {
  res.json(top10movies);
});

app.get("/", (req,res) => {
  res.send('Welcome to MyFlix');
});

app.use(express.static('public'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
