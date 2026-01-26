const express=require('express');
const router = express.Router();
const user = require('../models/user');
const catchAsync = require('../Utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');



router.get('/register',(req,res)=>{
    res.render('users/register');
})
router.post('/register',catchAsync(async(req,res)=>{
    try{
    const {username,email,password} = req.body;
    const newUser = new user({username,email});
    const registeredUser = await user.register(newUser,password);//this register method is inbuilt in passport package 
    req.login(registeredUser,err=>{
        if (err)return next(err);
        req.flash('success',`Welcome to Yelp Camp, ${req.user.username} !!`)
        res.redirect('/campgrounds');
    })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}))
router.get('/login',(req,res)=>{
    res.render('users/login');
})
router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    (req, res) => {
        req.flash('success', `Welcome back ${req.user.username} !!`);
        const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
        res.redirect(redirectUrl);
    });
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 
//req.logout() is provided as an inbuilt method by passport
module.exports=router;