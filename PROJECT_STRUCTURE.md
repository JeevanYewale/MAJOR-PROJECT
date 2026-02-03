# Project Structure

```
travelstay-clone/
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection
│   └── cloudinary.js      # Cloudinary setup
├── controllers/           # Business logic
│   ├── admin.js
│   ├── bookings.js
│   ├── listings.js
│   ├── payments.js
│   ├── reviews.js
│   └── users.js
├── middleware/            # Express middleware
│   ├── csrf.js           # CSRF protection
│   ├── formValidation.js # Form validation
│   └── security.js       # Security middleware
├── models/               # MongoDB schemas
│   ├── booking.js
│   ├── contactForm.js
│   ├── listing.js
│   ├── message.js
│   ├── review.js
│   └── user.js
├── routes/               # API routes
│   ├── admin.js
│   ├── analytics.js
│   ├── auth.js
│   ├── booking.js
│   ├── forms.js
│   ├── formStats.js
│   ├── listing.js
│   ├── messages.js
│   ├── payments.js
│   ├── review.js
│   └── users.js
├── utils/                # Utility functions
│   ├── analyticsService.js
│   ├── emailNotifications.js
│   ├── emailService.js
│   ├── ExpressError.js
│   ├── formExportService.js
│   ├── formSchemas.js
│   ├── formStatsService.js
│   ├── logger.js
│   ├── searchService.js
│   └── wrapAsync.js
├── views/                # EJS templates
│   ├── admin/
│   ├── bookings/
│   ├── forms/
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   └── error.ejs
├── public/               # Static files
│   ├── css/
│   ├── images/
│   └── js/
├── init/                 # Database initialization
│   ├── data.js
│   └── index.js
├── app.js               # Main application
├── package.json
├── .env
└── README.md
```

## Key Directories

### `/config`
- Database and external service configurations
- Environment-specific settings

### `/controllers`
- Business logic separated by feature
- Handles requests and responses

### `/middleware`
- Authentication, validation, security
- Request/response processing

### `/models`
- MongoDB schemas and models
- Data validation at schema level

### `/routes`
- API endpoints organized by feature
- Route handlers and middleware

### `/utils`
- Reusable services and helpers
- Email, analytics, search, export functions

### `/views`
- EJS templates organized by feature
- Layouts and includes for reusability

### `/public`
- CSS, JavaScript, images
- Client-side assets
