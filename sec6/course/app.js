const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
// const hbs = require('express-handlebars')

const app = express()

/* app.engine('hbs', hbs({
  layoutsDir: 'views/handlebars/layouts', // Default
  defaultLayout: 'main-layout',
  extname: 'hbs'
})) 
app.set('view engine', 'hbs')
app.set('views', 'views/handlebars')
*/
/* app.set('view engine', 'pug')
app.set('views', 'views/pug') */

app.set('view engine', 'ejs')
app.set('views', 'views/ejs')

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminData.routes)
app.use(shopRoutes)

app.use((req, res, next) => {
  res
    .status(404)
    .render('404', { 
      pageTitle: 'Page Not Found',
      path: false
    })
});

app.listen(3002)
