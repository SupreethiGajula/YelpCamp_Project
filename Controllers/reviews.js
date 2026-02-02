const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);//because when you submit the form from the showpage we gave the name as review[body] etc.. so they all go by the key "review" so we do req.body.review
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Successfully created a new Review!');

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res,next)=>{
    const{id,reviewId}=req.params;
    //the pull method is usd to pull anything with the value mentioned from the array of reviews here.
    const campground = await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Review Successfully Deleted');

    res.redirect(`/campgrounds/${campground._id}`)
}