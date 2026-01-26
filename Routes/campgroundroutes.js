const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas.js');//validation schema only
const catchAsync = require('../Utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../Utils/ExpressError');
const flash = require('connect-flash');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware.js');



////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/',catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index',{campgrounds});
}))
//the below both routes are for creating a new campground
router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
    })

router.post('/',isLoggedIn,validateCampground,catchAsync(async (req,res)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success','Successfully created a new campground');
    console.log(`campground added - ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`);
}))
//the below both routes are for editing of the campgrounds
router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground doesnot exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn,isAuthor,validateCampground,catchAsync(async (req, res) => {
    const { id } = req.params;
    //we r using the spread operator ...s 
    //check this later
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success','Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//the below route is to delete a campground
router.delete('/:id', isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Succesfully deleted the campground')
    res.redirect('/campgrounds');
}))
//this below route is a page to show the campground selected
router.get('/:id',catchAsync(async(req,res)=>{
    const id = req.params.id;
    //get these reviews and authors from the campground schema
    const campground = await Campground.findById(id)
    .populate({
        path: 'reviews',
        populate: { path: 'author' }//this is the author of that review
    }).populate('author');//this author is campground author
    if(!campground){
        req.flash('error','Campground doesnot exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}))

module.exports  = router;