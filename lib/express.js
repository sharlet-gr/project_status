import path from 'path';
import express from 'express';
import morgan from 'morgan';             
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import passport from 'passport';

export function initMiddleware(app){
	require('../config/passport')(passport);
	app.set('views', path.join(__dirname, '../app/views'));
	app.set('view engine', 'ejs');

	app.use(express.static(__dirname + '../public'));                 // set the static files location /public/img will be /img for users
	app.use(morgan('dev'));                                         // log every request to the console
	app.use(cookieParser());
	app.use(bodyParser());
	app.use(expressSession({secret: 'a secret'}));
	app.use(passport.initialize());
	app.use(passport.session());
}

export function initRoutes(app){
	require('../app/controllers/project')(app, passport);
	require('../app/controllers/employee')(app, passport);
}

export function init(db){
	let app = express();
	
	// Initialize Express middleware
	this.initMiddleware(app);

	// Initialize modules server routes
	this.initRoutes(app);

	return app;
}