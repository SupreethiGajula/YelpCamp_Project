if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}
const sanitizeV5 = require('./Utils/mongoSanitizeV5.js');

const express = require('express');
const app = express();
app.set('query parser', 'extended');
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
const { MongoStore}  = require('connect-mongo');
const flash = require('connect-flash')
const user = require('./models/user');
const passport  = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
/////////////////////////////////////////////
// 'mongodb://localhost:27017/yelp-camp'
//process.env.MongoDBURL
mongoose.connect(process.env.MongoDBURL,{
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
app.use(helmet());
//the below code is to configure for the content security policy 
//to tell the app to use which fonts,which images can be allowed etc.
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drhk33p6k/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));//to prevent mongo-injection attack

//------------------------------
//setting up mongo to store information about the session 
//------------------------------
const store = MongoStore.create({
    mongoUrl: process.env.MongoDBURL,
    touchAfter: 24 * 60 * 60, //this is timr in seconds
    crypto: {
        secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret'
    }
});
//the session info in mongoDB has a TTL of 14 days prolly and it will be removed after that

// ------------------------------
// 1️.Session FIRST
// ------------------------------
const sessionConfig = {
    store, // <-- MongoStore so session persists in Atlas
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only true in prod
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'none' 
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
app.get('/test-session', (req, res) => {
    res.send({
        user: req.user,
        session: req.session
    });
});


//////////////////////////////////////////////////////



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
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