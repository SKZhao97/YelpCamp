var express 	 = require("express");
var router  	 = express.Router();
var Campground 	 = require("../models/campground");
var middleware   = require("../middleware/index.js");
var nodeGeocoder = require("node-geocoder");
var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
    	callback(null, Date.now() + file.originalname);
  	}
});
var imageFilter = function (req, file, cb) {
    // accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Sorry, only image files are allowed!"), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "xcloudz", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	var name   = req.body.name;
	var price  = req.body.price;
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
		
		cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
			if(err) {
				req.flash('error', err.message);	
				return res.redirect('back');
			}
  			
  			var image = result.secure_url;
			var imageId = result.public_id;
			var newCampground = {name: name, price: price, image: image, imageId: imageId,
								 description: desc, author: author, location: location, lat: lat, lng: lng};
  			Campground.create(newCampground, function(err, newlyCreated) {
				if(err) {
					req.flash("error", err.message);
					return res.redirect("back");
				} else {
					res.redirect("/campgrounds/" + newlyCreated.id);
				};
			});
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
router.put("/:id", middleware.isLoggedIn, upload.single('image'), function(req,res){
	Campground.findById(req.params.id, async function(err, campground){
		if(err){
            req.flash("error", err.message);
            res.redirect("back");
		} else {
			if(req.file) {
				try {
					await cloudinary.v2.uploader.destroy(campground.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					campground.imageId = result.public_id;
                  	campground.image = result.secure_url;
				} catch (err) {
					req.flash("error", err.message);
                 	return res.redirect("back");
				}
			}
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			
			geocoder.geocode(req.body.location, function(err, data) {
				if(err || !data.length) {
				req.flash("error", "Invalid Address");
				return res.redirect("back");
				}
				campground.lat = data[0].latitude;
				campground.lng = data[0].longitude;
				campground.location = data[0].formattedAddress;
				campground.save();
				req.flash("success","Successfully Updated!");
            	res.redirect("/campgrounds/" + campground._id);
			});
		}
	});
});

// DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, async function(err, campground) {
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		try {
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash('success', 'Campground deleted successfully!');
			res.redirect('/campgrounds');
		} catch(err) {
			if(err) {
				req.flash("error", err.message);
				return res.redirect("back");
			}
		}
	});
});

module.exports = router;