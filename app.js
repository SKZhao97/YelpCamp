require('dotenv').config();

var express 	   = require("express");
var app        	   = express();
var bodyParser 	   = require("body-parser");
var mongoose 	   = require("mongoose");
var flash          = require("connect-flash");
var passport   	   = require("passport");
var LocalStrategy  = require("passport-local");
var methodOverride = require("method-override");
var Campground 	   = require("./models/campground");
var Comment 	   = require("./models/comment");
var User 		   = require("./models/user");
var seedDB 		   = require("./seeds");

// Requiring routes
var commentRoutes 	 = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes      = require("./routes/index");

//mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
mongoose.connect("mongodb+srv://SZ:topcoder@cluster0-s8cue.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }).then (() =>{
}).catch(err => {
	console.log('ERROR', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); // Seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "YOU WILL BE THE BEST",
	resave: false,
	saveUninitialized: false,
}));

app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);

var port = process.env.PORT || 3000
app.listen(port, function() {
//app.listen(process.env.PORT, process.env.IP, function() {
	console.log("**********The YelpCamp Server Has Started!**********");
});