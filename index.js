const express = require('express');
 morgan = require('morgan');
 bodyParser= require('body-parser');
 uuid= require('uuid');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());


let top10movies = [
  {name:"The Rescue",
genre: {name:'documentary'},
director: 'Jimmy Chin, Elizabeth Chai Vasarhelyi'},
  {name:"Raya",
  genre:{name:'family film'},
  director: 'Carlos López Estrada, Don Hall'},
  {name:"Frozen",
genre:{name:'family film'},
director: 'Chris Buck, Jennifer Lee'},
  {name:"Frozen II",
genre: {name:'family film'},
director: 'Chris Buck, Jennifer Lee'},
  {name:"Little Mermaid",
genre: {name:'family film'},
director: 'John Musker, Ron Clements'},
  {name:"Karate Kid",
genre:{name:'martial arts'},
director: 'Harald Zwart'},
  {name:"Secretly, Greatly",
genre: {name:'comedy-drama'},
director: 'Jang Cheol-soo'},
  {name:"ShangChi",
genre: {name:'marvel'},
director: "Destin Daniel Cretton"},
  {name:"Spider-Man: No Way Home",
genre:{name:'action'},
director: "Jon Watts"},
  {name:"Avengers: Endgame",
genre: {name:'action'},
director: "Anthony Russo, Joe Russo"},
];

let users= [
  {id: 1,
    name: "Cristine Fang",
    username: "cristinefang",
    favoritemovie:["The Rescue"],
    email: "cristinefang@gmail.com"
  }
  /*{id: 2,
    name: "Wallace Fang",
    username: "wallacefang",
    favoritemovie:["Karate Kid"],
    email: "wallacefangfang@gmail.com"
  }*/
];

app.get("/", (req,res) => {
  res.send('Welcome to MyFlix');
});

app.use(express.static('public'));



//Return a list of all movies to the user
app.get("/movies", (req, res) => {
  res.status(201).json(top10movies);
});

//Return data about a single movie by title
app.get("/movies/:name", (req, res)=>{
  const {name} = req.params;
  const movie = top10movies.find(movie => movie.name === name);

  if (movie){
    res.status(200).json(movie);
  }
    else{
      res.status(400).send('no such movie');
    }});


//Return data about a genre by title
app.get("movies/genre/:genreName", (req,res)=>{
  const {genreName} = req.params;
  const genre = top10movies.find(movie => movie.genre.name === genreName).genre;

  if (genre){
    res.status(200).json(genre);
  }
    else{
      res.status(400).send('no such genre');
    }});



//Return data about a director by name
app.get("movies/director/:director", (req,res)=>{
  const {directorName} = req.params;
  const director = top10movies.find(movie => movie.director === directorName).director;

  if (director){
    res.status(200).json(director);
  }
    else{
      res.status(400).send('no such director');
    }});



//Allow new users to register
app.post('/users', (req,res)=>{
  const newUser= req.body;

  if(newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)}
  else {
    res.status(400).send("invalid");
  }
});


//Allow user to edit username
app.put('/users/:id',(req,res)=>{
  const {id}= req.params;
  const updatedUser = req.body;

  let user = users.find(user=> users.id === id);

  if (user) {
    user.name=updatedUser.name;
    res.status(201).res(json);
  } else {
    res.status(404).send('User does not exist');
  }
});

/*
//Allow user to add favorite movie
app.put('/register/:name/:favoritemovie', (req,res)=>{
  let user = users.find(name) =>{return user.name === req.param.name});
  if (user){
    user.name[req.params.name]= parseInt(req.params.favoritemovie)
    res.status(201).send(req.params.favoritemovie + 'was added as a favorite movie.');
  } else {
    res.status(404).send('User with the name ' + req.params.name + ' was not found.');
  }

//Allow user to delete favorite movie
app.delete('/register/:name/:favoritemovie', (req,res) => {
  let user = users.find(name) => {return user.name === req.param.name});
  if (user) {
    users = user.filter((obj) => { return obj.favoritemovie !== req.params.favoritemovie });
    res.status(201).send('Student ' + req.params.favoritemovie + ' was deleted.');
  }
});
*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
