# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in TravelStay, please email security@travelstay.dev instead of using the issue tracker.

## Security Best Practices

### For Users
- Never share your login credentials
- Use strong, unique passwords
- Enable two-factor authentication when available
- Report suspicious activity immediately

### For Developers
- Always validate and sanitize user input
- Use parameterized queries to prevent SQL/NoSQL injection
- Keep dependencies updated
- Use HTTPS in production
- Implement CSRF protection on all state-changing operations
- Never commit sensitive data (.env files, API keys)
- Use environment variables for configuration

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Yes             |
| 1.x     | ❌ No              |

## Security Updates

Security updates will be released as soon as possible after discovery and verification.
