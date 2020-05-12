const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const token = "";
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: { api_key: token }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    errorMessage: message,
    pageTitle: 'Login',
    path: '/login',
    oldInput: {}
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    errorMessage: message,
    pageTitle: 'Signup',
    path: '/signup',
    oldInput: {}
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .render('auth/login', {
        errorMessage: errors.array()[0].msg,
        pageTitle: 'Login',
        path: '/login',
        oldInput: { 
          email: email, 
          password: password 
        }
      });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res
          .status(422)
          .render('auth/login', {
            errorMessage: 'Invalid email or password.',
            pageTitle: 'Login',
            path: '/login',
            oldInput: { 
              email: email, 
              password: password 
            }
          });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res
            .status(422)
            .render('auth/login', {
              errorMessage: 'Invalid email or password.',
              pageTitle: 'Login',
              path: '/login',
              oldInput: { 
                email: email, 
                password: password 
              }
            });
        })
        .catch(err => {
          console.log(err);
          res
            .status(422)
            .render('auth/login', {
              errorMessage: 'Invalid email or password.',
              pageTitle: 'Login',
              path: '/login',
              oldInput: { 
                email: email, 
                password: password 
              }
            });
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res
      .status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword
        }
      });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'kevan.jedi@gmail.com',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No acccount found');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'kevan.jedi@gmail.com',
          subject: 'Password Reset',
          html: `
            <p>You requested a password reset.</p>
            <p>Click <a href="http://localhost:3002/reset/${token}">this link</a> 
               to set a new password.</p>
          `
        });
      })
      .catch(error => console.log(error))
  })
};

exports.getSetNewPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const token = req.params.token;

  User.findOne({ 
    resetToken: token, 
    resetTokenExpiration: { $gt: Date.now() } 
  })
    .then(user => {
      res.render('auth/new-password', {
        pageTitle: 'Set a New Password',
        userId: user._id.toString(),
        path: '/new-password',
        errorMessage: message,
        resetToken: token
      });
    })
    .catch(error => console.log(error));
}

exports.postSetNewPassword = (req, res, next) => {
  const { userId, password, resetToken } = req.body;

  User.findOne({ 
    _id: userId,
    resetToken: resetToken, 
    resetTokenExpiration: { $gt: Date.now() }   
  })
    .then(user => {
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save()
        })
        .then(result => {
          res.redirect('/login');
        })
    })
    .catch(error => console.log(error))
}
