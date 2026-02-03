const Listing = require("./models/listing"); // Capital 'L' for Listing

module.exports.isLoggedIn = (req, res, next) => {
    console.log("🔐 Checking authentication for:", req.originalUrl);
    console.log("👤 User authenticated:", req.isAuthenticated());
    console.log("👤 User:", req.user ? req.user.username : 'None');
    
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Use req.user instead of res.locals.currUser
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to edit");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (error) {
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "Something went wrong");
        return res.redirect("/listings");
    }
};
