const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => { 
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate: { 
            path: "author" 
        },
    }).populate("owner");
    
    if (listing) {
        res.render("listings/show.ejs", { listing });
    } else{
        req.flash("error", "Listing you requestd does not exist!");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res, next) => { 
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;  // Should be a valid ObjectId
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry; // Assigning the geometry from geocoding response

    let savedListing = await newListing.save();
    // console.log(savedListing);
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
     if (listing) {
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/bo_3px_solid_lightblue/");  ///upload/w_250 
        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } else{
        req.flash("error", "Listing you requestd does not exist!");
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res) => {  
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save(); // Save the updated listing to the database
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id); 
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};