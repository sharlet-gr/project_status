let mongoose=require('mongoose');
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require('../app/models/employee');
let Employee = mongoose.model('Employee');
var configAuth = require('./auth');

module.exports = (passport) => {

	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        Employee.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // Employee.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            Employee.findOne({ 'emailId' : profile.emails[0].value}, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                	if(user.googleId){
                		// if a user is found and has google id, log them in
                    	return done(null, user);
                	}
                	user.googleId = profile.id;
                	user.googleToken = token;
                	user.name = profile.displayName;
                	user.save((err) => {
                		if(err)
                			throw err;
                		return done(null, user);
                	});

                } 
                else {
                    // if the user isn't in our database, give an error message
                    return done(null, false, {message: "Sorry! You are not registered yet."});
                }
            });
        });

    }));

}
