// Read the environment for security purposes
var dotenv = require('dotenv');
dotenv.config();

// Required dependencies
var express = require('express');
var path = require('path');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');  // For express session management
var session = require('express-session');  // For express session management

var router = express.Router();

// Define the routes to be used in a modularized way
var userInViews = require('./lib/middleware/userInViews');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');

// Define the express configuration 
var sess = {
    secret: '61d17bc5e26bbcc1608aa389850b8c20cc14e18447723c09100dfa9d59e08eba',
    cookie: {},
    resave: false,
    saveUninitialized: true
};

// **** PASSPORT SECTION - Configuration and Auth 0 strategy ****
// Load Passport
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL:
            process.env.AUTH0_CALLBACK_URL || 'https://localhost:3000/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);

passport.use(strategy);
// **** END OF PASSPORT SECTION ****


var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
if (app.get('env') === 'production') {
    // Use secure cookies in production (requires SSL/TLS)
    sess.cookie.secure = true;
}

// Define the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// App configuration to use express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define session management for express
app.use(session(sess));

// Initialize Passport with persistent login sessions.
app.use(passport.initialize());
app.use(passport.session());

// Apply the routes
app.use(userInViews());
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', usersRouter);


// User serialization/deserialization
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Export the router
module.exports = router;

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Export the app
module.exports = app;
