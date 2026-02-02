const express = require('express');
const router = express.Router({mergeParams:true});//if you don't set this mergeparams you get an error because
                                                //  the default behaviour of router is to not take the
                                                //  params in it so if you want the id or any other param 
                                                // of the campground to be taken you need to set this 
const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../Utils/catchAsync');
const ExpressError = require('../Utils/ExpressError');
const { validateReview, isLoggedIn ,isReviewAuthor} = require('../middleware');
const reviewController = require('../Controllers/reviews');


/////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////

//the below route corresponds to the reviews associated with a particular campground.
router.post('/',validateReview,isLoggedIn,catchAsync(reviewController.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviewController.deleteReview));

module.exports = router;
