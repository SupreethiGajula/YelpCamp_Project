const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas.js');//validation schema only
const catchAsync = require('../Utils/catchAsync');
const Campground = require('../models/campground');
const ExpressError = require('../Utils/ExpressError');
const flash = require('connect-flash');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware.js');
const campgroundController = require('../Controllers/campgrounds');

const multer = require('multer');
const { storage } = require('../CloudConfig');
const upload = multer({ storage });


///////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/',catchAsync(campgroundController.index))
//the below both routes are for creating a new campground

router.get('/new',isLoggedIn,campgroundController.newFormForCampground);

router.post('/',isLoggedIn,upload.array('images'), validateCampground,catchAsync(campgroundController.createNewCampground));
//the below both routes are for editing of the campgrounds
router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync(campgroundController.editCampgroundForm));

router.put('/:id', isLoggedIn,isAuthor,upload.array('images'),validateCampground,catchAsync(campgroundController.updateCampground));

//the below route is to delete a campground
router.delete('/:id', isLoggedIn,isAuthor,catchAsync(campgroundController.deleteCampground))
//this below route is a page to show the campground selected

router.get('/:id',catchAsync(campgroundController.showCampground))

module.exports  = router;



//we can use something called router.route() to group similar routes together that have different http requests like get,post etc 
// so for these below routes we can :
// router.get('/',catchAsync(campgroundController.index))
// router.post('/',isLoggedIn,validateCampground,catchAsync(campgroundController.createNewCampground));

// router.route('/')
//     .get(catchAsync(campgroundController.index))
//     .post(isLoggedIn,validateCampground,catchAsync(campgroundController.createNewCampground))

// and for these below routes:

// router.put('/:id', isLoggedIn,isAuthor,validateCampground,catchAsync(campgroundController.updateCampground));

// router.delete('/:id', isLoggedIn,isAuthor,catchAsync(campgroundController.deleteCampground))

// router.get('/:id',catchAsync(campgroundController.showCampground))

// router.route('/:id')
//     .put(isLoggedIn,isAuthor,validateCampground,catchAsync(campgroundController.updateCampground))
//     .delete(isLoggedIn,isAuthor,catchAsync(campgroundController.deleteCampground))
//     .get(catchAsync(campgroundController.showCampground))

//i decide to keep it the way it is now :)