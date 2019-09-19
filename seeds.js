var mongoose = require("mongoose");
var Coffeeshop = require("./models/coffeeshop");
var Comment = require("./models/comment");

var data = [
    {
        name: "Coffee's Nest", 
        image: "https://images.unsplash.com/photo-1458819714733-e5ab3d536722?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Of all places in our neighborhood, the local coffee shop located just a few steps away from my house is the coziest little nook where one can spend the night."
    },
    {
        name: "Desert Coffee", 
        image: "https://images.unsplash.com/photo-1530032582480-edd739014c39?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "If you are looking for a quiet coffee shope to study, look no further"
    },
    {
        name: "Canyon Coffee", 
        image: "https://images.unsplash.com/photo-1502849394214-c4b6352145ee?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Of all places in our neighborhood, the local coffee shop located just a few steps away from my house is the coziest little nook where one can spend the night."
    }
]
 

function seedDB(){
   //Remove all coffeeshops
   Coffeeshop.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed coffeeshops!");
        Comment.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few coffeeshops
            data.forEach(function(seed){
                Coffeeshop.create(seed, function(err, coffeeshop){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a coffeeshop");
                        //create a comment
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    coffeeshop.comments.push(comment);
                                    coffeeshop.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;
//var Comment   = require("./models/comment");