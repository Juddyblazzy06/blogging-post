require('dotenv').config();

const express = require('express');
const app = express();

const expressLayout = require('express-ejs-layouts');

//Method Override
const methodOverride = require('method-override');

//Cookie Parser
const cookieParser = require('cookie-parser');

//Session
const session = require('express-session');
const mongoStore = require('connect-mongo');

//Flash Messages
const flash = require('connect-flash');

const connectDb = require('./server/config/db');

const PORT = process.env.PORT || 5000;

//Database Connection
connectDb();

// urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Method Override
app.use(methodOverride('_method'));

//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: { maxAge: new Date(Date.now() + 3600000) },
  })
);

//use flash
app.use(flash())


//public folder
app.use(express.static('public'));

//Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');

//Set Template Engine
app.set('view engine', 'ejs');



app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

//For testing purpose
module.exports = app;


app.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`);
})