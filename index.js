const express = require('express');
morgan = require('morgan');
bodyParser = require('body-parser');
uuid = require('uuid');
mongoose = require('mongoose');

Models = require('./models.js');
const { check, validationResult } = require('express-validator');


const Movies = Models.Movie;
const Users = Models.User;

require('dotenv').config();
//const source= process.env.CONNECTION_URI;
console.log(process.env.CONNECTION_URI);
mongoose.connect('mongodb+srv://myFlixDBadmin:Cr1st1n3.@myflixdb.094if0q.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();


app.use(morgan('common'));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


app.get("/", (req, res) => {
  res.send('Welcome to MyFlix');
});

app.use(express.static('public'));

app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is invalid.').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
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
app.get('/users'/*, passport.authenticate('jwt', { session: false }*/), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + error);
    })
};

//Return specific user
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => { res.json(user) })
    .catch((err) => {
      res.status(500).send('Error' + error);
    })
});


app.put('/users/:Username', passport.authenticate('jwt', { session: false }),[
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is invalid.').isEmail()], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    )
  });

//Add a movie to user's list of favorite
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push:
      { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error:' + err);
      } else {
        res.json(updatedUser);
      }
    })
});

//Remove a movie from user's list of favorite
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull:
      { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error:' + err);
      } else {
        res.json(updatedUser);
      }
    })
});



// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies', /*passport.authenticate('jwt', {session: false}),*/(req, res) => {
  Movies.find()
    .then((movie) => {
      res.status(201).json(movie)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    })
});

//Return data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => { res.json(movie) })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + error);
    })
});

//Return data about a single movie by movie ID
app.get('/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "id": req.params.movieId })
    .then((movie) => { res.json(movie) })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + error);
    })
});


//Return data about genre by genre name
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ 'Genre.Name': req.params.genreName }) //not sure about this naming convention
    .then((movie) => {
      res.status(201).json(movie)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error' + error);
    })
});



//Return data about a director by name
app.get("/movies/director/:directorName", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Director.Name": req.params.directorName })
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port)
});
