exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    isAuthenticated: req.session.isLoggedIn,
    pageTitle: 'Page Not Found',
    path: '/404'
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    isAuthenticated: req.session.isLoggedIn,
    pageTitle: 'Error Occurred',
    path: '/500'
  });
};
