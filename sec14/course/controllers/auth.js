const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    isAuthenticated: false,
    pageTitle: 'Login',
    path: '/login',
  });
};

exports.postLogin = (req, res, next) => {
  // Assume login is successful
  User.findById('5ea1d2d92e5c3bbf5471f153')
    .then(user => {
      req.session.user = user._id;
      req.session.save(err => {
        console.log(err);
        res.redirect('/');
      })
    })
    .catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
}