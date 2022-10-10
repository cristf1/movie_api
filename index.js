const express = require('express');
 morgan = require('morgan');
 bodyParser= require('body-parser');
 uuid= require('uuid');
 mongoose = require('mongoose');
 Models = require ('./models.js');


 const Movies = Models.Movie;
 const Users = Models.User;

 mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();


app.use(morgan('common'));
app.use(bodyParser.json());

 let auth = require('./auth')(app);
 const passport = require('passport');
require('./passport');


let top10movies = [
  {name:"The Rescue",
genre: {name:'documentary'},
director:{name:['Jimmy Chin', 'Elizabeth Chai Vasarhelyi']} },
  {name:"Raya",
  genre:{name:'family film'},
  director: {name:['Carlos López Estrada', 'Don Hall']}},
  {name:"Frozen",
genre:{name:'family film'},
director: {name:['Chris Buck', 'Jennifer Lee'] } },
  {name:"Frozen II",
genre: {name:'family film'},
director: {name:['Chris Buck', 'Jennifer Lee']}},
  {name:"Little Mermaid",
genre: {name:'family film'},
director:{name: ['John Musker', 'Ron Clements']} },
  {name:"Karate Kid",
genre:{name:'martial arts'},
director:{name:'Harald Zwart'}},
  {name:"Secretly, Greatly",
genre: {name:'comedy-drama'},
director: {name:'Jang Cheol-soo'}},
  {name:"ShangChi",
genre: {name:'marvel'},
director: {name:'Destin Daniel Cretton'}},
  {name:"Spider-Man: No Way Home",
genre:{name:'action'},
director: {name:'Jon Watts'}},
  {name:"Avengers: Endgame",
genre: {name:'action'},
director:{name:["Anthony Russo", "Joe Russo"]}},
];

let users= [
  {id: 1,
    name: "Cristine Fang",
    username: "cristinefang",
    favoritemovie:["The Rescue"],
    email: "cristinefang@gmail.com"
  },
  {id: 2,
    name: "Wallace Fang",
    username: "wallacefang",
    favoritemovie:["Karate Kid"],
    email: "wallacefangfang@gmail.com"
  }
];

app.get("/", (req,res) => {
  res.send('Welcome to MyFlix');
});

app.use(express.static('public'));

app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) =>{
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((error)=>{
    console.error(error);
    res.status(500).send('Error:' + error);
  });
});


//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/


app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


//Return Users Collection
app.get('/users', (req,res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error:' + error);
  })
});

//Return specific user
app.get('/users/:Username', (req,res)=> {
  Users.findOne({Username: req.params.Username})
  .then((user)=> {res.json(user)})
  .catch((err)=> {
    res.status(500).send('Error'+ error);
  })
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Add a movie to user's list of favorite
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username:req.params.Username},{$push:
  {FavoriteMovies: req.params.MovieID}
},
{new:true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error:' + err);
  } else {
    res.json(updatedUser);
  }
})
});

//Remove a movie from user's list of favorite
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username:req.params.Username},{$pull:
  {FavoriteMovies: req.params.MovieID}
},
{new:true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error:' + err);
  } else {
    res.json(updatedUser);
  }
})
});



// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//MOVIES

//Return a list of all movies to the user
app.get('/movies', (req, res)=>{
  Movies.find()
  .then((movie)=>{
    res.status(201).json(movie)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error:' + err);
  })
});

//Return data about a single movie by title
app.get('/movies/:Title', (req, res)=>{
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {res.json(movie)})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:'+ error);
  })
});


//Return data about genre by genre name
app.get("/movies/genre/:genreName", (req,res)=>{
  Movies.find({'Genre.Name':req.params.genreName}) //not sure about this naming convention
  .then((movie) => {
    res.status(201).json(movie)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error' + error);
  })
});



//Return data about a director by name
app.get("/movies/director/:directorName", (req,res)=>{
  Movies.find({"Director.Name":req.params.directorName})
  .then((movie) => {
    res.json(movie)
  })
  .catch((err) => {
    res.status(500).send('Error:' + error);
  })
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
