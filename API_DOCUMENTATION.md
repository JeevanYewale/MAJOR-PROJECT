# API Documentation

## Forms API

### Submit Contact Form
- **POST** `/forms/submit`
- **Body:** `{ name, email, phone, subject, message }`
- **Response:** `{ message, formId }`

### Get All Forms (Admin)
- **GET** `/forms/all`
- **Response:** Array of forms

### Get Form Details
- **GET** `/forms/:id`
- **Response:** Form object

### Update Form Status
- **PUT** `/forms/:id/status`
- **Body:** `{ status: 'new|read|replied' }`
- **Response:** Updated form

### Delete Form
- **DELETE** `/forms/:id`
- **Response:** `{ message }`

### Export Forms to CSV
- **GET** `/forms/export/csv`
- **Response:** CSV file

### Export Forms to JSON
- **GET** `/forms/export/json`
- **Response:** JSON file

## Form Statistics API

### Get Form Statistics
- **GET** `/form-stats/stats`
- **Response:** `{ total, newForms, readForms, repliedForms }`

### Get Submissions by Day
- **GET** `/form-stats/submissions-by-day?days=30`
- **Response:** Array of daily submission counts

### Get Top Subjects
- **GET** `/form-stats/top-subjects?limit=5`
- **Response:** Array of top subjects with counts

### Get Response Time
- **GET** `/form-stats/response-time`
- **Response:** `{ avgTime }`

## Messages API

### Get Conversation
- **GET** `/messages/conversation/:userId`
- **Response:** Array of messages

### Send Message
- **POST** `/messages/send`
- **Body:** `{ recipientId, content, listingId }`
- **Response:** Message object

### Mark as Read
- **PUT** `/messages/:messageId/read`
- **Response:** Updated message

### Get Unread Count
- **GET** `/messages/unread/count`
- **Response:** `{ unreadCount }`

## Analytics API

### Get Dashboard Stats
- **GET** `/analytics/dashboard`
- **Response:** `{ totalUsers, totalListings, totalBookings, totalRevenue }`

### Get Revenue by Month
- **GET** `/analytics/revenue?months=12`
- **Response:** Array of monthly revenue data

### Get Top Listings
- **GET** `/analytics/top-listings?limit=10`
- **Response:** Array of top performing listings

### Get User Growth
- **GET** `/analytics/user-growth?months=12`
- **Response:** Array of monthly user growth data

### Get Average Rating
- **GET** `/analytics/average-rating`
- **Response:** `{ averageRating }`

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "status": 400
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
