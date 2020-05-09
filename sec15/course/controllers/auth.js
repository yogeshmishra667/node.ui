const bcrypt = require('bcryptjs')

const User = require('../models/user');

getFlashMessage = (message) => {
  return (message.length > 0)
    ? message[0]
    : null;
};

exports.getLogin = (req, res, next) => {
  const message = getFlashMessage(req.flash('error'));
  
  res.render('auth/login', {
    errorMessage: message,
    pageTitle: 'Login',
    path: '/login'
  });
};

exports.getSignup = (req, res, next) => {
  const message = getFlashMessage(req.flash('error'));

  res.render('auth/signup', {
    errorMessage: message,
    pageTitle: 'Signup',
    path: '/signup'
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.password)
        .then(matched => {
          if (matched) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              return res.redirect('/');
            });
          }
          
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        })
        .catch(error => {
          req.flash('error', 'Invalid email or password');
          res.redirect('/login')
        });
    })
    .catch(error => console.log(error));
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email: email })
    .then(existing => {
      if (existing) {
        req.flash('error', 'User already exists.');
        return res.redirect('/signup');
      }

      return bcrypt
        .hash(password, 12)
        .then(encrypted => {
          const user = new User({
            email: email,
            password: encrypted, 
            cart: {
              items: []
            }
          });
    
          return user.save();
        })
        .then(() => res.redirect('/login'));
    })
    .catch(error => console.log(error));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
