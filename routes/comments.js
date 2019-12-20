
var express = require("express");
var router = express.Router({mergeParams: true});
var Coffeeshop = require("../models/coffeeshop");
var Comment = require("../models/comment");

//Comments new
router.get("/new",isLoggedIn, function(req,res){
    //find  coffeeshop by id
    Coffeeshop.findById(req.params.id, function(err,coffeeshop){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{coffeeshop: coffeeshop});
        }
    });
});

//Comments Create
router.post("/", isLoggedIn, function(req,res){
    Coffeeshop.findById(req.params.id, function(err,coffeeshop){
        if(err){
            console.log(err)
            res.redirect("/coffeeshops");
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment 
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
            
                    //save comment
                    comment.save();
                    coffeeshop.comments.push(comment);
                    coffeeshop.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect('/coffeeshops/' + coffeeshop._id);
                }
            });
        }
    });
});

//coffeeshops/:id/comments/:comment_id/edit
router.get("coffeeshops/:id/comments/:comment_id/edit", function(req,res){
    res.render("comments/edit",{coffeeshop_id: req.params.id});
});


//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", CheckCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
            res.redirect("back");
        }else{
         res.render("comments/edit", {coffeeshop_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE
router.put("/:comment_id",CheckCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err,updatedComment){
        if(err){
           res.redirect("back");
        }else{
            res.redirect("/coffeeshops/" + req.params.id);
        }
    });
});

//DELETE COMMENTS

router.delete("/:comment_id",CheckCommentOwnership,function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       }else{
           req.flash("success", "Comment deleted");
          res.redirect("/coffeeshops/" +req.params.id);
       }
   });
});

//Middlewarea
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be loogged in to do that");
    res.redirect("/login");
}


function CheckCommentOwnership(req, res, next){
    
     if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
             req.flash("error", "Coffeeshop not found");
            res.redirect("back");
        }else{
            if(JSON.stringify(foundComment.author.id) === JSON.stringify(req.user._id)){
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