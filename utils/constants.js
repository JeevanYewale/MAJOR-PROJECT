module.exports = {
  // HTTP Status Codes
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_INTERNAL_ERROR: 500,

  // Form Status
  FORM_STATUS: {
    NEW: 'new',
    READ: 'read',
    REPLIED: 'replied'
  },

  // Booking Status
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },

  // User Roles
  USER_ROLES: {
    USER: 'user',
    HOST: 'host',
    ADMIN: 'admin'
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  DEFAULT_PAGE: 1,

  // Validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_MESSAGE_LENGTH: 5000,
  MIN_MESSAGE_LENGTH: 10,

  // Cache
  CACHE_TTL: 3600, // 1 hour in seconds

  // Ratings
  MIN_RATING: 1,
  MAX_RATING: 5
};
