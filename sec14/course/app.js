const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectSession = require('connect-mongodb-session');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_URI = 'mongodb://localhost:27017/nodejs-sessions';

const app = express();

const MongoDbStore = connectSession(session);
const sessionStore = new MongoDbStore({
  uri: MONGO_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
  saveUninitialized: false,
  secret: 'node-js-course', 
  store: sessionStore,
  resave: false
}));

/* app.use((req, res, next) => {
  User.findById('5ea1d2d92e5c3bbf5471f153')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
}); */

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Kevan Stuart',
          email: 'kevan.jedi@gmail.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3002);
  })
  .catch(err => {
    console.log(err);
  });
