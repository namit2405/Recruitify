# Testing Guide - Email Verification & MFA

## Prerequisites

1. Django backend running on http://127.0.0.1:8000
2. Frontend running on http://localhost:5173
3. Django console visible to see OTP codes

## Test 1: Registration with Email Verification

### Steps:
1. Open browser to http://localhost:5173/register/candidate
2. Fill in the form:
   - Email: `testuser@example.com`
   - Password: `password123` (min 8 characters)
3. Click "Create account & continue"
4. **Check Django Console** - You should see output like:
   ```
   Content-Type: text/plain; charset="utf-8"
   Subject: Verify Your Email - Recruitify
   From: Recruitify <noreply@recruitify.com>
   To: testuser@example.com
   
   Your verification code is: 123456
   ```
5. Copy the 6-digit code (e.g., `123456`)
6. You'll be redirected to `/verify-otp` page
7. Enter the 6-digit OTP code
8. Click verify or wait for auto-submit
9. ✅ You should be logged in and redirected to candidate dashboard

### Expected Results:
- ✅ Registration form submitted successfully
- ✅ OTP email printed in Django console
- ✅ Redirected to OTP verification page
- ✅ OTP accepted
- ✅ Automatically logged in
- ✅ Redirected to dashboard

### What to Check:
- User account created but inactive initially
- After OTP verification, account becomes active
- `email_verified` field set to True
- JWT tokens stored in localStorage

## Test 2: Login with MFA

### Steps:
1. Logout if logged in
2. Go to http://localhost:5173/login
3. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `password123`
4. Click "Sign In"
5. **Check Django Console** for OTP:
   ```
   Subject: Login Verification Code - Recruitify
   
   Your verification code is: 654321
   ```
6. Copy the 6-digit code
7. You'll be redirected to `/verify-otp` page
8. Enter the OTP code
9. ✅ You should be logged in

### Expected Results:
- ✅ Credentials verified
- ✅ MFA OTP sent (printed in console)
- ✅ Redirected to OTP verification page
- ✅ OTP accepted
- ✅ Successfully logged in
- ✅ Redirected to dashboard

## Test 3: Resend OTP

### Steps:
1. Start registration or login flow
2. Get to OTP verification page
3. Wait for 60-second timer to complete
4. Click "Resend Code" button
5. **Check Django Console** for new OTP
6. Enter the new OTP code
7. ✅ Should verify successfully

### Expected Results:
- ✅ Timer counts down from 60 seconds
- ✅ "Resend Code" button appears after timer
- ✅ New OTP generated and printed
- ✅ Old OTP becomes invalid
- ✅ New OTP works correctly

## Test 4: Invalid OTP

### Steps:
1. Get to OTP verification page
2. Enter wrong code: `000000`
3. ✅ Should show error: "Invalid OTP code"

### Expected Results:
- ✅ Error message displayed
- ✅ Can try again with correct code
- ✅ No login/registration completed

## Test 5: Expired OTP

### Steps:
1. Start registration/login
2. Wait 11 minutes (OTP expires after 10 minutes)
3. Try to enter the OTP
4. ✅ Should show error: "OTP has expired"
5. Click "Resend Code"
6. Enter new OTP
7. ✅ Should work

### Expected Results:
- ✅ Expired OTP rejected
- ✅ Clear error message
- ✅ Can request new OTP
- ✅ New OTP works

## Test 6: Organization Registration

### Steps:
1. Go to http://localhost:5173/register/organization
2. Fill in email and password
3. Click "Create account & continue"
4. Check Django console for OTP
5. Enter OTP on verification page
6. ✅ Should be logged in
7. Fill organization details
8. Submit profile
9. ✅ Redirected to organization dashboard

### Expected Results:
- ✅ Same OTP flow as candidate
- ✅ Email verification required
- ✅ Can complete profile after verification

## Test 7: Paste OTP

### Steps:
1. Get to OTP verification page
2. Copy 6-digit code from console: `123456`
3. Click on first OTP input box
4. Paste (Ctrl+V or Cmd+V)
5. ✅ All 6 digits should fill automatically
6. ✅ Auto-submit should trigger

### Expected Results:
- ✅ Paste detection works
- ✅ All boxes filled
- ✅ Auto-verification triggered

## Test 8: Admin Panel

### Steps:
1. Create superuser if not exists:
   ```bash
   python manage.py createsuperuser
   ```
2. Go to http://127.0.0.1:8000/admin/
3. Login with superuser credentials
4. Check "Users" section:
   - ✅ Should see `email_verified` and `mfa_enabled` columns
5. Check "OTP Verifications" section:
   - ✅ Should see all OTP records
   - ✅ Can filter by purpose (registration/login)
   - ✅ Can see verification status

### Expected Results:
- ✅ New fields visible in User admin
- ✅ OTPVerification model registered
- ✅ Can view OTP history
- ✅ Cannot manually create OTPs (security)

## Test 9: Disable MFA for User

### Steps:
1. Go to Django admin
2. Find user in Users section
3. Edit user
4. Uncheck "Mfa enabled"
5. Save
6. Logout and login with that user
7. ✅ Should login directly without OTP

### Expected Results:
- ✅ MFA can be disabled per user
- ✅ Login works without OTP when disabled
- ✅ Registration still requires email verification

## Test 10: Multiple OTP Requests

### Steps:
1. Start registration
2. Request OTP (first code)
3. Click "Resend Code" immediately after timer
4. Request OTP again (second code)
5. Try first code
6. ✅ Should fail (old code invalidated)
7. Try second code
8. ✅ Should work

### Expected Results:
- ✅ Only latest OTP is valid
- ✅ Old OTPs automatically invalidated
- ✅ No confusion with multiple codes

## Common Issues & Solutions

### Issue: OTP not showing in console
**Solution**: Make sure Django server is running and you're looking at the correct terminal window

### Issue: "Email not verified" error on login
**Solution**: Complete the registration OTP verification first

### Issue: OTP expired immediately
**Solution**: Check system time is correct. OTP expires after 10 minutes.

### Issue: Can't paste OTP
**Solution**: Click on first input box before pasting

### Issue: Resend button not appearing
**Solution**: Wait for 60-second timer to complete

## Success Criteria

All tests should pass with these results:
- ✅ Registration requires email verification
- ✅ Login requires MFA (if enabled)
- ✅ OTP codes work correctly
- ✅ Resend functionality works
- ✅ Invalid/expired OTPs rejected
- ✅ Paste functionality works
- ✅ Admin panel shows new fields
- ✅ MFA can be disabled per user

## Performance Checks

- OTP generation: < 100ms
- Email sending (console): < 50ms
- OTP verification: < 100ms
- Page redirects: Instant
- Auto-submit: < 500ms after last digit

## Security Checks

- ✅ OTPs are random 6-digit numbers
- ✅ OTPs expire after 10 minutes
- ✅ OTPs can only be used once
- ✅ Old OTPs invalidated on resend
- ✅ Passwords are hashed
- ✅ JWT tokens used for authentication
- ✅ Email verification required before login

## Next Steps After Testing

1. ✅ All tests pass → Ready for production email setup
2. ❌ Some tests fail → Check error messages and logs
3. Configure SMTP for production emails
4. Add rate limiting for security
5. Consider adding SMS OTP as backup

## Test Checklist

- [ ] Test 1: Registration with Email Verification
- [ ] Test 2: Login with MFA
- [ ] Test 3: Resend OTP
- [ ] Test 4: Invalid OTP
- [ ] Test 5: Expired OTP
- [ ] Test 6: Organization Registration
- [ ] Test 7: Paste OTP
- [ ] Test 8: Admin Panel
- [ ] Test 9: Disable MFA
- [ ] Test 10: Multiple OTP Requests

## Support

If any test fails:
1. Check Django console for errors
2. Check browser console for frontend errors
3. Check network tab for API responses
4. Review `MFA_AND_EMAIL_VERIFICATION_GUIDE.md`
5. Run `scripts/test_otp_flow.py` for backend tests
