const { campgroundSchema,reviewSchema} = require('./schemas.js');//validation schema only
const ExpressError = require('./Utils/ExpressError');
const Campground = require('./models/campground')
const Review = require('./models/review')


const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login'); 
    }
    next(); 
};
//isAuthenticate method is an inbuilt method provided by express
module.exports.isLoggedIn = isLoggedIn;
//the returnTo is set by us to that session just to comback to the 
//page where the user was when he wanted to login instead of coming back to all campgrounds

// we put this in the middleware.js file here due to some recent security improvements in the Passport.js version updates (used for authentication in our YelpCamp application), the session now gets cleared after a successful login.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//the below method are to validate the campground with the values we defined with joi in schemas.js
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);//validate is internal method in joi
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You donot have access for this operation');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//the below methods are to validate the review with the values we defined with joi in schemas.js

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }

}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You donot have access for this operation');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}