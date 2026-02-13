# Authentication Flow Diagrams

## Registration Flow with Email Verification

```
┌─────────────┐
│   User      │
│ Opens       │
│ Register    │
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Fill Registration Form     │
│  - Email                    │
│  - Password                 │
│  - User Type                │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST /auth/register/       │
│  Backend:                   │
│  1. Create inactive user    │
│  2. Generate 6-digit OTP    │
│  3. Send email with OTP     │
│  4. Return: requires_       │
│     verification = true     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Redirect to                │
│  /verify-otp page           │
│  (purpose: registration)    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  User checks email          │
│  (Django console in dev)    │
│  Copies 6-digit OTP         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Enter OTP on page          │
│  (Auto-submit when          │
│   all 6 digits entered)     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST /auth/register/       │
│       verify-otp/           │
│  Backend:                   │
│  1. Verify OTP              │
│  2. Activate user           │
│  3. Set email_verified=True │
│  4. Return JWT tokens       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Store tokens in            │
│  localStorage               │
│  User logged in!            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Redirect to Dashboard      │
│  - Organization → Org Dash  │
│  - Candidate → Cand Dash    │
└─────────────────────────────┘
```

## Login Flow with MFA

```
┌─────────────┐
│   User      │
│ Opens       │
│ Login Page  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Enter Credentials          │
│  - Email                    │
│  - Password                 │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST /auth/login/          │
│  Backend:                   │
│  1. Verify credentials      │
│  2. Check email_verified    │
│  3. Check mfa_enabled       │
└──────┬──────────────────────┘
       │
       ├─── MFA Disabled ────────────┐
       │                             │
       │                             ▼
       │                    ┌─────────────────┐
       │                    │ Return JWT      │
       │                    │ tokens directly │
       │                    └────────┬────────┘
       │                             │
       │                             ▼
       │                    ┌─────────────────┐
       │                    │ Login Complete  │
       │                    └─────────────────┘
       │
       └─── MFA Enabled ─────────────┐
                                     │
                                     ▼
                            ┌─────────────────────────────┐
                            │  Backend:                   │
                            │  1. Generate 6-digit OTP    │
                            │  2. Send email with OTP     │
                            │  3. Return: requires_mfa    │
                            │     = true                  │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  Redirect to                │
                            │  /verify-otp page           │
                            │  (purpose: login)           │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  User checks email          │
                            │  Copies 6-digit OTP         │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  Enter OTP on page          │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  POST /auth/login/          │
                            │       verify-otp/           │
                            │  Backend:                   │
                            │  1. Verify OTP              │
                            │  2. Return JWT tokens       │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  Store tokens               │
                            │  User logged in!            │
                            └──────┬──────────────────────┘
                                   │
                                   ▼
                            ┌─────────────────────────────┐
                            │  Redirect to Dashboard      │
                            └─────────────────────────────┘
```

## OTP Resend Flow

```
┌─────────────────────────────┐
│  User on OTP Verify Page    │
│  Timer: 60 seconds           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Timer reaches 0             │
│  "Resend Code" button        │
│  becomes active              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  User clicks                 │
│  "Resend Code"               │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST /auth/resend-otp/     │
│  {                           │
│    email: "user@email.com",  │
│    purpose: "registration"   │
│  }                           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Backend:                    │
│  1. Delete old OTPs          │
│  2. Generate new OTP         │
│  3. Send new email           │
│  4. Return success           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Show success message        │
│  Reset timer to 60 seconds   │
│  User enters new OTP         │
└─────────────────────────────┘
```

## OTP Verification Logic

```
┌─────────────────────────────┐
│  User enters 6-digit OTP     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend validates:         │
│  - All 6 digits entered      │
│  - Only numbers              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  POST verify-otp endpoint    │
│  {                           │
│    email: "user@email.com",  │
│    otp_code: "123456"        │
│  }                           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Backend checks:             │
│  1. OTP exists?              │
│  2. Matches email?           │
│  3. Correct purpose?         │
│  4. Not already verified?    │
│  5. Not expired?             │
└──────┬──────────────────────┘
       │
       ├─── Any check fails ──────┐
       │                          │
       │                          ▼
       │                 ┌─────────────────┐
       │                 │ Return error:   │
       │                 │ - Invalid OTP   │
       │                 │ - Expired OTP   │
       │                 └─────────────────┘
       │
       └─── All checks pass ──────┐
                                  │
                                  ▼
                         ┌─────────────────────────────┐
                         │  Mark OTP as verified       │
                         │  Set verified_at timestamp  │
                         └──────┬──────────────────────┘
                                │
                                ▼
                         ┌─────────────────────────────┐
                         │  If registration:           │
                         │  - Activate user            │
                         │  - Set email_verified=True  │
                         │                             │
                         │  Return JWT tokens          │
                         └─────────────────────────────┘
```

## Database State Changes

### Registration Flow

```
Initial State:
┌──────────────────────────────┐
│ User Table                   │
│ - email: user@example.com    │
│ - is_active: False           │
│ - email_verified: False      │
│ - mfa_enabled: True          │
└──────────────────────────────┘

After OTP Sent:
┌──────────────────────────────┐
│ OTPVerification Table        │
│ - email: user@example.com    │
│ - otp_code: "123456"         │
│ - purpose: "registration"    │
│ - is_verified: False         │
│ - expires_at: now + 10 min   │
└──────────────────────────────┘

After OTP Verified:
┌──────────────────────────────┐
│ User Table                   │
│ - email: user@example.com    │
│ - is_active: True ✅         │
│ - email_verified: True ✅    │
│ - mfa_enabled: True          │
└──────────────────────────────┘
┌──────────────────────────────┐
│ OTPVerification Table        │
│ - is_verified: True ✅       │
│ - verified_at: timestamp ✅  │
└──────────────────────────────┘
```

### Login Flow

```
Before Login:
┌──────────────────────────────┐
│ User Table                   │
│ - email: user@example.com    │
│ - is_active: True            │
│ - email_verified: True       │
│ - mfa_enabled: True          │
└──────────────────────────────┘

After MFA OTP Sent:
┌──────────────────────────────┐
│ OTPVerification Table        │
│ - email: user@example.com    │
│ - otp_code: "654321"         │
│ - purpose: "login"           │
│ - is_verified: False         │
│ - expires_at: now + 10 min   │
└──────────────────────────────┘

After MFA OTP Verified:
┌──────────────────────────────┐
│ OTPVerification Table        │
│ - is_verified: True ✅       │
│ - verified_at: timestamp ✅  │
└──────────────────────────────┘
┌──────────────────────────────┐
│ JWT Tokens Issued            │
│ - access_token               │
│ - refresh_token              │
└──────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Layer 1                │
│         Password Authentication         │
│  - Hashed passwords (Django default)    │
│  - Min 8 characters                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Security Layer 2                │
│         Email Verification              │
│  - Proves email ownership               │
│  - Required before login                │
│  - 6-digit OTP                          │
│  - 10-minute expiry                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Security Layer 3                │
│         Multi-Factor Authentication     │
│  - Second factor after password         │
│  - Fresh OTP per login                  │
│  - 6-digit OTP                          │
│  - 10-minute expiry                     │
│  - Can be disabled per user             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Security Layer 4                │
│         JWT Token Authentication        │
│  - Stateless authentication             │
│  - Access token (1 day)                 │
│  - Refresh token (7 days)               │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────┐
│  User Action                 │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  API Request                 │
└──────┬──────────────────────┘
       │
       ├─── Success ──────────────┐
       │                          │
       │                          ▼
       │                 ┌─────────────────┐
       │                 │ Process result  │
       │                 │ Show success    │
       │                 │ Redirect        │
       │                 └─────────────────┘
       │
       └─── Error ───────────────┐
                                 │
                                 ▼
                        ┌─────────────────────────────┐
                        │  Error Type:                │
                        │                             │
                        │  400 Bad Request            │
                        │  → Show validation error    │
                        │                             │
                        │  401 Unauthorized           │
                        │  → Invalid credentials      │
                        │                             │
                        │  403 Forbidden              │
                        │  → Email not verified       │
                        │                             │
                        │  404 Not Found              │
                        │  → User/OTP not found       │
                        │                             │
                        │  500 Server Error           │
                        │  → Generic error message    │
                        └──────┬──────────────────────┘
                               │
                               ▼
                        ┌─────────────────────────────┐
                        │  Display toast notification │
                        │  Keep user on current page  │
                        │  Allow retry                │
                        └─────────────────────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                             │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ LoginPage    │    │ RegisterPage │                 │
│  └──────┬───────┘    └──────┬───────┘                 │
│         │                   │                          │
│         └───────┬───────────┘                          │
│                 │                                      │
│                 ▼                                      │
│         ┌──────────────┐                              │
│         │ useAuth Hook │                              │
│         └──────┬───────┘                              │
│                │                                      │
│                ▼                                      │
│         ┌──────────────┐                              │
│         │ VerifyOTP    │                              │
│         │ Page         │                              │
│         └──────┬───────┘                              │
│                │                                      │
│                ▼                                      │
│         ┌──────────────┐                              │
│         │ OTPInput     │                              │
│         │ Component    │                              │
│         └──────┬───────┘                              │
└────────────────┼────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
┌────────────────┼────────────────────────────────────────┐
│                ▼                Backend                 │
│         ┌──────────────┐                              │
│         │ API Views    │                              │
│         │ - Register   │                              │
│         │ - Login      │                              │
│         │ - VerifyOTP  │                              │
│         │ - ResendOTP  │                              │
│         └──────┬───────┘                              │
│                │                                      │
│                ▼                                      │
│         ┌──────────────┐                              │
│         │ OTP Manager  │                              │
│         │ - create_otp │                              │
│         │ - verify_otp │                              │
│         │ - send_email │                              │
│         └──────┬───────┘                              │
│                │                                      │
│                ▼                                      │
│         ┌──────────────┐                              │
│         │ Database     │                              │
│         │ - User       │                              │
│         │ - OTPVerif   │                              │
│         └──────────────┘                              │
└─────────────────────────────────────────────────────────┘
```
