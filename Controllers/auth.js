const passport = require('passport');
const user = require('../models/user');
const { storeReturnTo } = require('../middleware');


module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register');
}

module.exports.registerUser = async(req,res)=>{
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
}

module.exports.renderloginForm = (req,res)=>{
    res.render('users/login');
}

module.exports.loginUser = (req, res) => {
        req.flash('success', `Welcome back ${req.user.username} !!`);
        const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
        res.redirect(redirectUrl);
    }


module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}


