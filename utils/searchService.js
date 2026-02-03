const Listing = require('../models/listing');

class SearchService {
  static async advancedSearch(filters = {}) {
    const {
      location,
      minPrice,
      maxPrice,
      minRating,
      amenities = [],
      guests,
      checkIn,
      checkOut,
      page = 1,
      limit = 12
    } = filters;

    let query = {};

    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { title: { $regex: location, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    if (amenities.length > 0) {
      query.amenities = { $in: amenities };
    }

    const skip = (page - 1) * limit;
    
    const listings = await Listing.find(query)
      .populate('owner', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Listing.countDocuments(query);

    return {
      listings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getSearchSuggestions(query) {
    const suggestions = await Listing.find({
      $or: [
        { location: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } }
      ]
    })
      .select('location country')
      .limit(5)
      .distinct('location');

    return suggestions;
  }

  static async getPopularSearches() {
    return await Listing.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  }
}

module.exports = SearchService;
