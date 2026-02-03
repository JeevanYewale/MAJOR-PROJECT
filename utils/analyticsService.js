const Listing = require('../models/listing');
const Booking = require('../models/booking');
const User = require('../models/user');
const Review = require('../models/review');

class AnalyticsService {
  static async getDashboardStats() {
    const [totalUsers, totalListings, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    return {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    };
  }

  static async getRevenueByMonth(months = 12) {
    const data = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return data;
  }

  static async getTopListings(limit = 10) {
    return await Listing.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'listing',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          bookingCount: { $size: '$bookings' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
      { $project: { title: 1, location: 1, bookingCount: 1, price: 1 } }
    ]);
  }

  static async getUserGrowth(months = 12) {
    return await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  static async getAverageRating() {
    const result = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    return result[0]?.avgRating || 0;
  }
}

module.exports = AnalyticsService;
