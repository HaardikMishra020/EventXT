const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const dotenv=require('dotenv');
const Listing = require("./models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/EventXT";
const path = require("path");
const methodOverride = require("method-override"); 
const ejsMate = require("ejs-mate");
const rwClient=require("./twitterClient.js");
dotenv.config();
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    {
        await mongoose.connect(MONGO_URL);
    }
}
app.get("/", (req, res) => {
    res.send("Hi, I am root!");
});

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({}).sort({datetime:1});
    res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", async (req, res) => {
    let { title, description, image, price, college, location,datetime } = req.body;
    const newListing = new Listing({
        title,
        description,
        image,
        price,
        college,
        location,
        datetime,
    });
    await newListing.save();
    res.redirect("/listings");
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let { title, description, image, price, country, location } = req.body;

    await Listing.findByIdAndUpdate(id, {
        title,
        description,
        image,
        price,
        country,
        location,
    });
    res.redirect("/listings");
});

//Route to share event as a tweet
app.get("/listings/:id/share-twitter",async(req,res)=>{
    try{
        const lists=await Listing.find({_id:req.params.id})
        const desc=lists[0].description;
        const tweetText = `${lists[0].title}
${desc}
Location: ${lists[0].college} ${lists[0].location}
Tickets Starting from: ₹${lists[0].price}
Book Now
- ${(Math.random()*100).toFixed(2)}`;
        await rwClient.v2.tweet({text:tweetText});


        // const mediaId=await rwClient.v1.uploadMedia('./public/img/sonam.jpg');
        // await rwClient.v2.tweet({text:desc,
        //     media:{media_ids:[mediaId]}
        // });

        res.redirect("/listings");
    }
    catch(err){
        console.log(err);
        res.redirect('/listings');
    }
})

//Delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

//multiple delete route
app.get("/delete",async(req,res)=>{
    let x=await Listing.deleteMany();
    res.send(x);
});



app.listen(8080, () => {
    console.log("Server is listening to the port 8080");
});
