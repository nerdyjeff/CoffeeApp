var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Coffeeshop = require("./models/coffeeshop");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");


//mongoose.connect("mongodb://localhost:27017/coffee_house_v10",{useNewUrlParser:true});
mongoose.connect('mongodb+srv://kanmacloudguru:Alphadog_001@cluster0-dtiqn.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB');
}).catch(err => {
    console.log('ERROR:', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/public"));
seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This is a death wish",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Coffeeshop.create(
//     {
//     name: "Three Seat Coffee", 
//     image:"https://cdn.pixabay.com/photo/2017/06/02/11/49/still-life-2366084__340.jpg",
//     description: " Awesome cofee shop!! Go here!!"
//     },
//     function(err, coffeeshop){
//         if(err){
//             console.log(err);
//         }else {
//             console.log("Newly created Coffeeshop: ");
//             console.log(coffeeshop);
//         }
//     });

        
app.get("/", function(req,res){
    res.render("landing");
});

//INDEX - show all coffeeshops
app.get("/coffeeshops", function(req, res){
    // get all coffeeshops from DB
    Coffeeshop.find({}, function(err,allcoffeeshops){
       if(err){
           console.log(err);
       } else {
           res.render("coffeeshops/index",{coffeeshops:allcoffeeshops});
       }
    });
       // res.render("coffeeshops",{coffeeshops:coffeeshops});
});

app.post("/coffeeshops", function(req,res){
   //getting data from form and add to coffeshops array
   var  name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCoffeeshop = {name: name, image: image, description: desc}
   // Create a new coffeeshop and save to database
   Coffeeshop.create(newCoffeeshop, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else{
          //redirect back to coffeeshops
          res.redirect("/coffeeshops");
      }
   });
});

//This shows the form to fill out to add another coffee shop
app.get("/coffeeshops/new", function(req,res){
    res.render("coffeeshops/new");
});

//Shows more info about one coffeeshop
app.get("/coffeeshops/:id", function(req, res){
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



//==========================
// COMMENTS ROUTES
//==========================

app.get("/coffeeshops/:id/comments/new", function(req,res){
    //find  coffeeshop by id
    Coffeeshop.findById(req.params.id, function(err,coffeeshop){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{coffeeshop: coffeeshop});
        }
    });
});

app.post("/coffeeshops/:id/comments", function(req,res){
    Coffeeshop.findById(req.params.id, function(err,coffeeshop){
        if(err){
            console.log(err)
            res.redirect("/coffeeshops");
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                } else {
                    coffeeshop.comments.push(comment);
                    coffeeshop.save();
                    res.redirect('/coffeeshops/' + coffeeshop._id);
                }
            });
        }
    });
});


//===========
// AUTH ROUTES
//=============

//Show register form
app.get("/register",function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req,res){
    var newUser =  new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            
            return res.render("register")
        }
        passport.authenticate("local")(req,res, function(){
            res.redirect("/coffeeshops");
        });
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Coffee addicts server has started");
});