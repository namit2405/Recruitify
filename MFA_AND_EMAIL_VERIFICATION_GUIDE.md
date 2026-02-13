# Email Verification & MFA Implementation Guide

## Overview

This project now includes:
1. **Email OTP Verification** during registration
2. **Multi-Factor Authentication (MFA)** during login

## Features Implemented

### 1. Email Verification on Registration
- Users receive a 6-digit OTP code via email after registration
- Account is inactive until email is verified
- OTP expires after 10 minutes
- Users can resend OTP if needed

### 2. MFA on Login
- After successful password authentication, users receive an OTP via email
- Login is completed only after OTP verification
- MFA is enabled by default for all users
- OTP expires after 10 minutes

## Backend Changes

### New Models
- **OTPVerification**: Stores OTP codes with expiration and verification status
- **User Model Updates**:
  - `email_verified`: Boolean field to track email verification
  - `mfa_enabled`: Boolean field to enable/disable MFA (default: True)

### New API Endpoints

#### Registration Flow
1. `POST /auth/register/` - Register user and send OTP
   - Request: `{ "email": "user@example.com", "password": "password123", "user_type": "candidate" }`
   - Response: `{ "message": "...", "email": "...", "requires_verification": true }`

2. `POST /auth/register/verify-otp/` - Verify registration OTP
   - Request: `{ "email": "user@example.com", "otp_code": "123456" }`
   - Response: `{ "access": "...", "refresh": "...", "user": {...} }`

#### Login Flow
1. `POST /auth/login/` - Authenticate and send MFA OTP
   - Request: `{ "email": "user@example.com", "password": "password123" }`
   - Response: `{ "message": "...", "email": "...", "requires_mfa": true }`

2. `POST /auth/login/verify-otp/` - Verify login OTP
   - Request: `{ "email": "user@example.com", "otp_code": "123456" }`
   - Response: `{ "access": "...", "refresh": "...", "user": {...} }`

#### Utility Endpoint
- `POST /auth/resend-otp/` - Resend OTP code
  - Request: `{ "email": "user@example.com", "purpose": "registration" }` (or "login")
  - Response: `{ "message": "Verification code sent successfully" }`

### Email Configuration

#### Development Mode (Current)
Emails are printed to the Django console for testing:
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

#### Production Mode (To Configure)
Update `settings.py` with SMTP settings:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'Recruitify <noreply@recruitify.com>'
```

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password in `EMAIL_HOST_PASSWORD`

Add to `.env`:
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Frontend Changes

### New Components
- **OTPInput.jsx**: Reusable 6-digit OTP input component with auto-focus and paste support
- **VerifyOTPPage.jsx**: Page for OTP verification (both registration and login)

### Updated Pages
- **LoginPage.jsx**: Redirects to OTP verification if MFA is required
- **RegisterCandidatePage.jsx**: Redirects to OTP verification after registration
- **RegisterOrganizationPage.jsx**: Redirects to OTP verification after registration

### Updated Hooks
- **useAuth.jsx**: 
  - `login()` now returns `{ requires_mfa: true, email }` if MFA is needed
  - `register()` now returns `{ requires_verification: true, email }` if verification is needed

## User Flow

### Registration Flow
1. User fills registration form
2. User submits form
3. Backend creates inactive user account
4. Backend sends OTP to user's email
5. User is redirected to OTP verification page
6. User enters 6-digit OTP
7. Backend verifies OTP and activates account
8. User is logged in automatically
9. User is redirected to dashboard

### Login Flow
1. User enters email and password
2. Backend verifies credentials
3. If MFA is enabled:
   - Backend sends OTP to user's email
   - User is redirected to OTP verification page
   - User enters 6-digit OTP
   - Backend verifies OTP
4. User is logged in
5. User is redirected to dashboard

## Testing

### Test Registration with OTP
1. Start Django server: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Go to registration page
4. Fill in email and password
5. Check Django console for OTP code
6. Enter OTP on verification page
7. Verify successful login

### Test Login with MFA
1. Use an existing verified account
2. Go to login page
3. Enter email and password
4. Check Django console for OTP code
5. Enter OTP on verification page
6. Verify successful login

### Test OTP Resend
1. On OTP verification page
2. Wait for 60-second timer to complete
3. Click "Resend Code"
4. Check Django console for new OTP
5. Enter new OTP

## Database Migrations

Run these commands to apply the new database schema:
```bash
cd ProjectCode/backend
python manage.py makemigrations
python manage.py migrate
```

## Security Considerations

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **One-time Use**: OTPs can only be used once
3. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks
4. **HTTPS**: Always use HTTPS in production
5. **Email Security**: Use app-specific passwords, not main account passwords

## Disabling MFA for Specific Users

To disable MFA for a user (via Django admin or shell):
```python
from accounts.models import User
user = User.objects.get(email='user@example.com')
user.mfa_enabled = False
user.save()
```

## Troubleshooting

### OTP Not Received
- Check Django console (development mode)
- Verify email configuration (production mode)
- Check spam folder
- Verify email address is correct

### OTP Expired
- Request a new OTP using "Resend Code"
- OTPs are valid for 10 minutes only

### Email Not Verified Error
- Complete the registration OTP verification
- Check if `email_verified` field is True in database

## Future Enhancements

1. **SMS OTP**: Add SMS as alternative to email
2. **Backup Codes**: Generate backup codes for account recovery
3. **Remember Device**: Option to skip MFA on trusted devices
4. **Rate Limiting**: Implement rate limiting on OTP endpoints
5. **Email Templates**: Use HTML email templates instead of plain text
6. **Admin Panel**: Add UI to manage MFA settings per user

## Files Modified/Created

### Backend
- `accounts/models.py` - Added OTPVerification model, email_verified, mfa_enabled fields
- `accounts/views.py` - Updated auth views with OTP flow
- `accounts/urls.py` - Added new OTP endpoints
- `accounts/otp_manager.py` - NEW: OTP generation and verification logic
- `accounts/migrations/0005_*.py` - NEW: Database migration
- `recruitify_backend/settings.py` - Added email configuration

### Frontend
- `components/OTPInput.jsx` - NEW: OTP input component
- `pages/VerifyOTPPage.jsx` - NEW: OTP verification page
- `pages/LoginPage.jsx` - Updated with MFA flow
- `pages/RegisterCandidatePage.jsx` - Updated with OTP flow
- `pages/RegisterOrganizationPage.jsx` - Updated with OTP flow
- `hooks/useAuth.jsx` - Updated to handle OTP responses
- `App.jsx` - Added verify-otp route

## Support

For issues or questions, check:
1. Django console for error messages
2. Browser console for frontend errors
3. Network tab for API request/response details
