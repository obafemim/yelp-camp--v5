const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
Campground = require("./models/campground");
Comment = require("./models/comment");
seedDB = require("./seeds");

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Campground.create(
//   {
//     name: "Mount Nabooru",
//     image: "https://images.unsplash.com/photo-1485343034225-9e5b5cb88c6b",
//     description: "A location in The Legend of Zelda: Breath of the Wild. It is located in the Gerudo province of Hyrule."
//   }, function(err, campground) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Newly created campground: ");
//       console.log(campground);
//     }
//   });

// let campgrounds = [
//   {name: "Lake Hylia", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e"},
//   {name: "Korok Forest", image: "https://images.unsplash.com/photo-1498855926480-d98e83099315"},
//   {name: "Mount Nabooru", image: "https://images.unsplash.com/photo-1485343034225-9e5b5cb88c6b"},
//   {name: "Goronbi Lake", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e"},
//   {name: "Rito Forest", image: "https://images.unsplash.com/photo-1498855926480-d98e83099315"},
//   {name: "Gerudo Highlands", image: "https://images.unsplash.com/photo-1485343034225-9e5b5cb88c6b"}
// ]

app.get("/", function(req, res) {
  res.render("landing");
});

// INDEX route shows all campgrounds
app.get("/campgrounds", function(req, res) {
  // get all campgrounds from DB.
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds});
    }
  });
});

// CREATE route adds new campgrounds to database
app.post("/campgrounds", function(req, res) {
  // get data from form and add to campgrounds array.
  let name = req.body.name
  let image = req.body.image
  let desc = req.body.description
  let newCampground = {name: name, image: image, description: desc}
  // create a new campground and save to DB.
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
        // redirect back to campgrounds page.
        res.redirect("/campgrounds");
    }
  });
});

// NEW route shows form to create new campground
// You have to have 2 routes to send a post request.
// You need one to show the form... and you need one to submit the form somewhere... which is our CREATE route.
app.get("/campgrounds/new", function(req, res) {
  res.render("campgrounds/new.ejs");
});

// SHOW shows more info about one campground
app.get("/campgrounds/:id", function(req, res) {
  // find the campground with provided id.
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
    if (err) {
      console.log(err);
    } else {
        // render show template with that campground
        res.render("campgrounds/show.ejs", {campground: foundCampground});
    }
  })

});

// NEW route shows form to create new comment
app.get("/campgrounds/:id/comments/new", function(req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
    } else {
        // render show template with that comment
        res.render("comments/new.ejs", {campground: campground});
    }
  })
});

// CREATE route adds new campgrounds to database
app.post("/campgrounds/:id/comments", function(req, res) {
  // get data from form and add to campgrounds array.
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
        // redirect back to campgrounds page.
        Comment.create(req.body.comment, function(err, comment) {
          if (err) {
            console.log(err);
          } else {
              // redirect back to campgrounds page.
              campground.comments.push(comment);
              campground.save();
              res.redirect("/campgrounds/" + campground._id);
          }
        });
    }
  });
});

app.listen(3000, function() {
  console.log("The YelpCamp server has started!")
});
