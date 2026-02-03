# 🏠 TravelStay - Complete Airbnb Clone

A full-featured travel booking platform built with Node.js, Express, MongoDB, and modern web technologies.

## ✨ Features

### 🔍 Core Features
- **Advanced Search & Filters** - Location, dates, guests, price range, amenities
- **Interactive Maps** - Leaflet.js integration with property locations
- **Categories** - Beachfront, Cabins, Mountains, City, Luxury, etc.
- **Wishlist System** - Save and organize favorite properties
- **Real-time Messaging** - Host-guest communication system

### 🏡 Listing Management
- **Rich Property Details** - Photos, descriptions, amenities, house rules
- **Dynamic Pricing** - Seasonal rates and demand-based pricing
- **Availability Calendar** - Real-time booking management
- **Photo Upload** - Cloudinary integration for image storage
- **Location Services** - Interactive maps with property markers

### 💰 Booking System
- **Instant Book & Request to Book** - Flexible booking options
- **Booking Approval Workflow** - Host confirmation system
- **Payment Integration** - Secure payment processing
- **Booking Management** - View, modify, cancel bookings
- **Email Notifications** - Automated booking confirmations

### 👤 User Management
- **Multiple Authentication** - Email, Google, Facebook, Phone OTP, Magic Links
- **User Profiles** - Detailed profiles with verification badges
- **Host Dashboard** - Earnings, bookings, analytics
- **Guest Features** - Trip history, reviews, favorites
- **Role-based Access** - Guest, Host, Admin permissions

### 🔐 Security & Trust
- **User Verification** - Email, phone, ID verification
- **Review System** - Bidirectional host-guest reviews
- **Secure Payments** - Encrypted payment processing
- **Rate Limiting** - DDoS protection
- **Input Sanitization** - XSS and injection prevention
- **HTTPS Security** - SSL/TLS encryption

### 📊 Admin Features
- **Analytics Dashboard** - Revenue, bookings, user metrics
- **User Management** - View, suspend, delete users
- **Listing Moderation** - Approve, reject, feature listings
- **Booking Oversight** - Monitor all platform bookings
- **System Health** - Performance monitoring

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first approach
- **Clean Interface** - Minimalist, professional design
- **Interactive Elements** - Smooth animations and transitions
- **Accessibility** - WCAG compliant design
- **Performance Optimized** - Fast loading times

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher) - Install locally or use MongoDB Atlas
- Cloudinary account (for image uploads) - Free tier available

### Installation

1. **Clone or Download the Project**
```bash
# If you have the project folder
cd "MAJOR PROJECT"
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
The `.env` file is already configured with working Cloudinary credentials. You can use it as-is or update with your own:

```env
# Database (Default - works out of the box)
MONGO_URL=mongodb://127.0.0.1:27017/wanderlust

# Session Secret (Default - change in production)
SESSION_SECRET=mysupersecretcode

# Cloudinary (Pre-configured - working credentials)
CLOUD_NAME=djyr5qobo
CLOUD_API_KEY=858858199295316
CLOUD_API_SECRET=Cu9Ky07h_nb2gokB7coN9xefJE4

# Optional: Update these for email features
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. **Start MongoDB**
```bash
# Windows (if MongoDB is installed locally)
mongod

# Or use MongoDB Atlas (cloud) by updating MONGO_URL in .env
```

5. **Initialize Database with Sample Data**
```bash
node init-db.js
```

6. **Start the Application**
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start

# Or use the startup script
node start.js
```

7. **Access the Application**
- Main Site: http://localhost:8080
- Admin Panel: http://localhost:8080/admin (login as admin/admin123)

### Default Login Credentials
- **Username:** admin
- **Password:** admin123

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check if port 27017 is available
   - Use MongoDB Atlas if local installation fails

2. **Port 8080 Already in Use**
   ```bash
   # Kill process using port 8080
   npx kill-port 8080
   ```

3. **Missing Dependencies**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Image Upload Issues**
   - The project uses pre-configured Cloudinary credentials
   - Images should upload automatically
   - Check console for any Cloudinary errors

### Quick Fix Commands
```bash
# Reset everything
npm run clean-install

# Reinitialize database
node init-db.js

# Check if all services are running
npm run health-check
```

## 📁 Project Structure

```
MAJOR PROJECT/
├── controllers/          # Route controllers
├── models/              # MongoDB schemas
├── routes/              # Express routes
├── views/               # EJS templates
├── public/              # Static assets
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── init/                # Database initialization
├── .env                 # Environment variables
├── app.js               # Main application file
└── package.json         # Dependencies
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

### Frontend
- **EJS** - Template engine
- **Bootstrap 5** - CSS framework
- **Leaflet.js** - Interactive maps
- **Chart.js** - Analytics charts
- **Font Awesome** - Icons

### Security
- **Helmet.js** - Security headers
- **Express Rate Limit** - Rate limiting
- **CORS** - Cross-origin requests
- **Input Sanitization** - XSS protection
- **Bcrypt** - Password hashing

## 🔧 Configuration

### Database Setup
**Option 1: Local MongoDB (Recommended for Development)**
1. Install MongoDB Community Server
2. Start MongoDB: `mongod`
3. The app will connect automatically to `mongodb://127.0.0.1:27017/wanderlust`

**Option 2: MongoDB Atlas (Cloud)**
1. Create free account at mongodb.com/atlas
2. Create cluster and get connection string
3. Update `MONGO_URL` in `.env` file

### Cloudinary Setup (Already Configured)
The project includes working Cloudinary credentials. To use your own:
1. Create free account at cloudinary.com
2. Get API credentials from dashboard
3. Update these variables in `.env`:
   ```env
   CLOUD_NAME=your-cloud-name
   CLOUD_API_KEY=your-api-key
   CLOUD_API_SECRET=your-api-secret
   ```

### Email Setup (Optional)
For email notifications:
1. Use Gmail with App Password:
   - Enable 2FA on Gmail
   - Generate App Password
   - Update `EMAIL_USER` and `EMAIL_PASS` in `.env`

### OAuth Setup (Optional)
For social login features:
1. **Google OAuth**:
   - Google Cloud Console → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:8080/auth/google/callback`

2. **Facebook OAuth**:
   - Facebook Developers → Create App
   - Add Facebook Login product
   - Configure Valid OAuth Redirect URIs

## 📱 API Endpoints

### Authentication
- `POST /users/signup` - User registration
- `POST /users/login` - User login
- `GET /users/logout` - User logout
- `GET /auth/google` - Google OAuth
- `GET /auth/facebook` - Facebook OAuth

### Listings
- `GET /listings` - Get all listings
- `GET /listings/:id` - Get single listing
- `POST /listings` - Create listing (auth required)
- `PUT /listings/:id` - Update listing (owner only)
- `DELETE /listings/:id` - Delete listing (owner only)

### Bookings
- `GET /bookings` - Get user bookings
- `POST /bookings/listings/:id/book` - Create booking
- `POST /bookings/:id/approve` - Approve booking (host only)
- `POST /bookings/:id/reject` - Reject booking (host only)

### Search
- `GET /search` - Search listings with filters

## 🎯 User Roles

### Guest
- Browse and search listings
- Book properties
- Leave reviews
- Manage bookings
- Message hosts

### Host
- Create and manage listings
- Accept/reject bookings
- View earnings dashboard
- Communicate with guests
- Manage calendar

### Admin
- Full system access
- User management
- Listing moderation
- Analytics dashboard
- System monitoring

## 🔒 Security Features

- **Authentication**: Multiple login methods with session management
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: Protection against abuse
- **HTTPS**: Secure data transmission
- **Password Security**: Bcrypt hashing
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based protection

## 📊 Performance Features

- **Compression**: Gzip compression for responses
- **Caching**: Static asset caching
- **Image Optimization**: Cloudinary transformations
- **Database Indexing**: Optimized queries
- **Lazy Loading**: Images loaded on demand
- **Minification**: CSS/JS minification

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure SSL certificates
4. Set up reverse proxy (Nginx)
5. Use PM2 for process management

### Environment Variables
Ensure all production environment variables are set:
- Database URLs
- API keys
- Session secrets
- OAuth credentials

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@travelstay.com
- Documentation: [Wiki](link-to-wiki)

## 🎉 Acknowledgments

- Airbnb for inspiration
- Bootstrap team for the CSS framework
- MongoDB team for the database
- All contributors and testers

---

**Built with ❤️ by [Your Name]**