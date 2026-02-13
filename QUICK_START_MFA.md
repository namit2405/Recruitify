# Quick Start Guide - Email Verification & MFA

## 🚀 Get Started in 5 Minutes

### Step 1: Start Backend (1 minute)
```bash
cd ProjectCode/backend
.\venv\Scripts\activate
python manage.py runserver
```

Keep this terminal open - you'll see OTP codes here!

### Step 2: Start Frontend (1 minute)
```bash
cd ProjectCode/frontend
npm run dev
```

### Step 3: Test Registration (2 minutes)
1. Open http://localhost:5173/register/candidate
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Create account"
5. **Look at backend terminal** - copy the 6-digit code
6. Enter code on verification page
7. ✅ You're logged in!

### Step 4: Test Login (1 minute)
1. Logout
2. Go to http://localhost:5173/login
3. Enter same credentials
4. **Look at backend terminal** - copy the new 6-digit code
5. Enter code
6. ✅ Logged in with MFA!

---

## 📧 Where to Find OTP Codes

### Development Mode (Current)
OTP codes are printed in the **Django console** (backend terminal):

```
Subject: Verify Your Email - Recruitify
From: Recruitify <noreply@recruitify.com>
To: test@example.com

Your verification code is: 123456  ← COPY THIS

This code will expire in 10 minutes.
```

### Production Mode (After Setup)
OTP codes will be sent to actual email addresses.

---

## 🎯 What You Can Test

### ✅ Registration Flow
- Email verification required
- 6-digit OTP
- 10-minute expiry
- Resend after 60 seconds
- Auto-login after verification

### ✅ Login Flow
- MFA protection
- 6-digit OTP
- 10-minute expiry
- Resend functionality
- Can be disabled per user

### ✅ OTP Features
- Auto-focus on first input
- Auto-advance between digits
- Paste 6-digit codes
- Resend timer
- Error messages

---

## 🔧 Quick Configuration

### Disable MFA for Testing
```bash
# In Django shell
python manage.py shell

from accounts.models import User
user = User.objects.get(email='test@example.com')
user.mfa_enabled = False
user.save()
```

### Check User Status
```bash
python manage.py shell

from accounts.models import User
user = User.objects.get(email='test@example.com')
print(f"Email Verified: {user.email_verified}")
print(f"MFA Enabled: {user.mfa_enabled}")
print(f"Active: {user.is_active}")
```

### View OTP History
```bash
python manage.py shell

from accounts.models import OTPVerification
otps = OTPVerification.objects.filter(email='test@example.com')
for otp in otps:
    print(f"{otp.purpose}: {otp.otp_code} - Verified: {otp.is_verified}")
```

---

## 🐛 Troubleshooting

### Problem: Can't see OTP in console
**Solution**: Make sure you're looking at the Django terminal (backend), not frontend

### Problem: OTP expired
**Solution**: Click "Resend Code" button (appears after 60 seconds)

### Problem: "Email not verified" error
**Solution**: Complete registration OTP verification first

### Problem: Can't paste OTP
**Solution**: Click on first input box before pasting

---

## 📚 Documentation

- **Full Guide**: `MFA_AND_EMAIL_VERIFICATION_GUIDE.md`
- **Testing**: `TESTING_GUIDE.md`
- **Flows**: `AUTHENTICATION_FLOW.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🎓 Example Test Session

```bash
# Terminal 1: Backend
cd ProjectCode/backend
.\venv\Scripts\activate
python manage.py runserver

# Terminal 2: Frontend
cd ProjectCode/frontend
npm run dev

# Browser: http://localhost:5173
1. Register → test@example.com / password123
2. Check Terminal 1 for OTP
3. Enter OTP → Logged in!
4. Logout
5. Login → test@example.com / password123
6. Check Terminal 1 for new OTP
7. Enter OTP → Logged in with MFA!
```

---

## ✅ Success Checklist

After following this guide, you should have:
- [x] Backend running
- [x] Frontend running
- [x] Registered a test user
- [x] Verified email with OTP
- [x] Logged in with MFA
- [x] Seen OTP codes in console
- [x] Tested resend functionality

---

## 🚀 Next Steps

1. ✅ Test with different users
2. ✅ Try organization registration
3. ✅ Test OTP expiration
4. ✅ Test invalid OTP
5. ✅ Check admin panel
6. ⚠️ Configure SMTP for production
7. ⚠️ Deploy with HTTPS

---

## 💬 Need Help?

- Check `TESTING_GUIDE.md` for detailed test cases
- Check `MFA_AND_EMAIL_VERIFICATION_GUIDE.md` for full documentation
- Check Django console for error messages
- Check browser console for frontend errors

---

**That's it! You're ready to use Email Verification and MFA!** 🎉
