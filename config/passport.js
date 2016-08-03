import mongoose from 'mongoose';
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require('../app/models/employee');
let Employee = mongoose.model('Employee');
let configAuth = require('./auth');

module.exports = (passport) => {

	// used to serialize the user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser((id, done) => {
        Employee.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    (token, refreshToken, profile, done) => {

        // make the code asynchronous
        // Employee.findOne won't fire until we have all our data back from Google
        process.nextTick(() => {

            // try to find the user based on their google id
            Employee.findOne({ 'emailId' : profile.emails[0].value},(err, user) => {
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
