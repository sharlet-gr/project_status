module.exports = (app, passport)=> {
	app.get('/', (req, res) => {
		console.log("Session message: "+req.session.messages);
		res.json("Index");
		req.session.messages = [];
	});

	// send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
	app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

	// the callback after google has authenticated the user    
	app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/',
                    failureMessage: true
        	})
    );

   	// route for showing the profile page
    app.get('/profile', isLoggedIn, function(req, res) {
        res.json(req.user);
    });

    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}