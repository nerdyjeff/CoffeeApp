var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Coffeeshop = require("./models/coffeeshop");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

//Requiring Routes
var commentRoutes = require("./routes/comments"),
    coffeeshopRoutes = require("./routes/coffeeshops"),
    indexRoutes = require("./routes/index")

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
app.use(methodOverride("_method"));
app.use(flash());

//seedDB(); // Seed the database

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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/coffeeshops", coffeeshopRoutes);
app.use("/coffeeshops/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Coffee addicts server has started");
});