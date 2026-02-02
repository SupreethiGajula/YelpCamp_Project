const express=require('express');
const router = express.Router();
const user = require('../models/user');
const catchAsync = require('../Utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const authController = require('../Controllers/auth');



router.get('/register',authController.renderRegisterForm)

router.post('/register',catchAsync(authController.registerUser))

router.get('/login',authController.renderloginForm)

router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    authController.loginUser);
    
router.get('/logout', authController.logoutUser); 
//req.logout() is provided as an inbuilt method by passport
module.exports=router;