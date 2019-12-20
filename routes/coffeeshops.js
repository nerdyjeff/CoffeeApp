var express = require("express");
var router = express.Router();
var Coffeeshop = require("../models/coffeeshop");

//INDEX - show all coffeeshops
router.get("/", function(req, res){
    
    // get all coffeeshops from DB
    Coffeeshop.find({}, function(err,allcoffeeshops){
       if(err){
           console.log(err);
       } else {
           res.render("coffeeshops/index",{coffeeshops:allcoffeeshops, currentUser: req.user});
       }
    });
       // res.render("coffeeshops",{coffeeshops:coffeeshops});
});

//CREATE - addnew campground to DB
router.post("/", isLoggedIn, function(req,res){
   //getting data from form and add to coffeshops array
   var  name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   var newCoffeeshop = {name: name, image: image, description: desc, author:author}
   
   // Create a new coffeeshop and save to database
   Coffeeshop.create(newCoffeeshop, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else{
          //redirect back to coffeeshops
          console.log(newlyCreated);
          res.redirect("/coffeeshops");
      }
   });
});

//This shows the form to fill out to add another coffee shop
router.get("/new",isLoggedIn, function(req,res){
    res.render("coffeeshops/new");
});

//Shows more info about one coffeeshop
router.get("/:id", function(req, res){
    // find the coffeeshop with provided id
    Coffeeshop.findById(req.params.id).populate("comments").exec(function(err, foundCoffeeshop){
       if(err){
           console.log(err);
       } else{
           console.log(foundCoffeeshop);
           // render show template with that coffeshop
              res.render("coffeeshops/show",{coffeeshop: foundCoffeeshop});
       }
    }); 
    
});

//EDIT Coffeeshop Route

router.get("/:id/edit", CheckCoffeeshopOwnership, function(req,res){
         Coffeeshop.findById(req.params.id, function(err, foundCoffeeshop){
               res.render("coffeeshops/edit", {coffeeshop: foundCoffeeshop});
    });
});

//UPDATE COFFEESHOP ROUTE
router.put("/:id", CheckCoffeeshopOwnership, function(req,res){
   //find and update the correct coffeeshop
   Coffeeshop.findByIdAndUpdate(req.params.id, req.body.coffeeshop,function(err, updatedCoffeeshop){
       if(err){
           res.redirect("/coffeeshops");
       }else {
           res.redirect("/coffeeshops/" + req.params.id);
       }
   });
   //redirect to show page
});


// DESTROY COFFEESHOP ROUTE
router.delete("/:id", CheckCoffeeshopOwnership,function(req, res){
    Coffeeshop.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/coffeeshops");
        }else{
            res.redirect("/coffeeshops");
        }
    });
});
//Middlewarea
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be loogged in to do that");
    res.redirect("/login");
}

function CheckCoffeeshopOwnership(req, res, next){
    
     if(req.isAuthenticated()){
         Coffeeshop.findById(req.params.id, function(err, foundCoffeeshop){
        if(err){
            req.flash("error", "Coffeeshop not found");
            res.redirect("back");
        }else{
            if(JSON.stringify(foundCoffeeshop.author.id) === JSON.stringify(req.user._id)){
               next();
        }else{
             req.flash("error", "You dont have permission to do that");
            res.redirect("back");
        }
        }
    });
    }else{
        req.flash("error", "You need to be loogged in to do that");
        res.redirect("back");
    }
}


module.exports = router;
