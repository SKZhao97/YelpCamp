var express 	 = require("express");
var router  	 = express.Router();
var Campground 	 = require("../models/campground");
var middleware   = require("../middleware/index.js");
var nodeGeocoder = require("node-geocoder");

var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

var geocoder = nodeGeocoder(options);

// INDEX show all campgrounds
router.get("/", function(req,res) {	
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", 
					   {campgrounds: allCampgrounds, currentUser: req.user, page: 'campgrounds'});
		}
	});
});

// CREATE add new campground to the database
router.post("/", middleware.isLoggedIn, function(req, res) {
	var name   = req.body.name;
	var price  = req.body.price;
	var img    = req.body.image;
	var desc   = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length) {
			console.log(err);
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {name: name, price: price, image: img, description: desc, author: author, 
						 location: location, lat: lat, lng: lng};
		Campground.create(newCampground, function(err, newlyCreated) {
			if(err) {
				console.log(err);
			} else {
				res.redirect("/campgrounds");
			};
		});
	});
});

// NEW show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});

// SHOW show more info about one campground
router.get("/:id", function(req,res) {
	Campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground){
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Sorry, campground not found");
			res.redirect("/campgrounds");
		} else {
			//console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

// EDIT 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground) {		
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE
router.put("/:id", middleware.isLoggedIn, function(req,res){
	geocoder.geocode(req.body.location, function(err, data) {
		if(err || !data.length) {
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
			if(err){
				req.flash("error", err.message);
				res.redirect("/campgrounds");
			} else {
				req.flash("success", "Successfully updated!");
				res.redirect("/campgrounds/" + updatedCampground._id);
			}
		});
	});
});

// DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
});

module.exports = router;