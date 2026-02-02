if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodoverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const ExpressError = require('./Utils/ExpressError');
const campground = require('./models/campground');
const campgroundroutes = require('./Routes/campgroundroutes.js');
const reviewroutes = require('./Routes/reviewroutes.js');
const authroutes = require('./Routes/authroutes.js');
const { Cookie } = require('express-session');
const session = require('express-session');
const flash = require('connect-flash')
const user = require('./models/user');
const passport  = require('passport');
const LocalStrategy = require('passport-local');
/////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//to check if the database is connected succesfully
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
    console.log('Connected to MongoDB');
    });

////////////////////////////////////////////middleware
app.engine('ejs', ejsMate);
app.use(morgan('tiny'));

app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------
// 1️.Session FIRST
// ------------------------------
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
// ------------------------------
// 2. Flash NEXT
// ------------------------------
app.use(flash());
//------------------------------
// 3. Authentication utilities
//------------------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// ------------------------------
// 4. Make flash messages available in all templates
// ------------------------------
app.use((req, res, next) => {
    //making current user available to all templates to display the login,logout links in navbar
    //this req.user is provided to us by passport
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');  
    next();
});

// ------------------------------
// ROUTES
// ------------------------------
app.use('/campgrounds', campgroundroutes);
app.use('/campgrounds/:id/reviews', reviewroutes);
app.use('/',authroutes);


//////////////////////////////////////////////////////



app.listen('3000',(req,res)=>{
    console.log('server is running on port 3000');
})
app.get('/',(req,res)=>{
    res.render('campgrounds/home');
})




app.all(/(.*)/,(req,res,next)=>{//you could do this app.all('*',....) but you will get an error about regexp so modified accordingly
    next(new ExpressError('Page Not Found',404));
})
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "something went wrong"
    res.status(statusCode).render('error',{err});
});
//////////////////////////////////////////////