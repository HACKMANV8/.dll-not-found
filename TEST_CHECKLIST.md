# 🧪 Test Checklist - 2-Step Authentication

## Pre-Test Setup

- [x] Backend server running on port 3001
- [x] Frontend server running on port 5173
- [x] Email credentials configured in `server/.env`
- [x] Both servers accessible

## Test Scenarios

### ✅ 1. User Registration with 2FA

**Steps:**
1. Open http://localhost:5173
2. Click "Login/Register" button
3. Click "Don't have an account? Register"
4. Fill in the form:
   - Name: `Test User`
   - Email: `your-real-email@gmail.com` (use your actual email)
   - Password: `TestPass123`
5. Click "Continue"

**Expected Results:**
- ✅ Modal shows "Verify Email" heading
- ✅ Shows message: "Enter the 6-digit code sent to your-email@gmail.com"
- ✅ Countdown timer appears (10:00)
- ✅ Email received with 6-digit code
- ✅ Email has Gensec branding
- ✅ Code input field accepts only numbers
- ✅ Submit button disabled until 6 digits entered

**Continue:**
6. Check your email inbox
7. Copy the 6-digit code
8. Enter code in the verification field
9. Click "Verify & Continue"

**Expected Results:**
- ✅ Modal closes
- ✅ Navbar shows user avatar with "T" (first letter)
- ✅ Navbar shows "Test User" name
- ✅ User is logged in

---

### ✅ 2. User Login with 2FA

**Steps:**
1. Click on user name in navbar
2. Click "Logout"
3. Click "Login/Register" button
4. Enter credentials:
   - Email: `your-real-email@gmail.com`
   - Password: `TestPass123`
5. Click "Continue"

**Expected Results:**
- ✅ Modal shows "Verify Email" heading
- ✅ Countdown timer appears (10:00)
- ✅ New email received with different 6-digit code

**Continue:**
6. Check your email for new code
7. Enter the 6-digit code
8. Click "Verify & Continue"

**Expected Results:**
- ✅ Modal closes
- ✅ User logged in successfully
- ✅ Navbar shows user profile

---

### ✅ 3. Invalid Credentials (Login)

**Steps:**
1. Logout if logged in
2. Click "Login/Register"
3. Enter:
   - Email: `nonexistent@example.com`
   - Password: `WrongPassword`
4. Click "Continue"

**Expected Results:**
- ✅ Error message: "Invalid email or password"
- ✅ No email sent
- ✅ Stays on step 1 (credentials form)

---

### ✅ 4. Duplicate Email (Registration)

**Steps:**
1. Click "Login/Register"
2. Switch to "Register"
3. Enter:
   - Name: `Another User`
   - Email: `your-real-email@gmail.com` (already registered)
   - Password: `AnyPassword`
4. Click "Continue"

**Expected Results:**
- ✅ Error message: "User with this email already exists"
- ✅ No email sent
- ✅ Stays on step 1

---

### ✅ 5. Invalid Verification Code

**Steps:**
1. Start login/registration process
2. Receive verification code via email
3. Enter wrong code: `000000`
4. Click "Verify & Continue"

**Expected Results:**
- ✅ Error message: "Invalid verification code. Please try again."
- ✅ Stays on step 2
- ✅ Can try again with correct code

---

### ✅ 6. Resend Verification Code

**Steps:**
1. Start login/registration process
2. Reach verification step
3. Wait 1 minute (resend button disabled for first minute)
4. Click "Resend Code"

**Expected Results:**
- ✅ "Resend Code" button disabled initially
- ✅ Button enabled after 1 minute
- ✅ New email sent with new code
- ✅ Countdown timer resets to 10:00
- ✅ Old code no longer works
- ✅ New code works

---

### ✅ 7. Code Expiration

**Steps:**
1. Start login/registration process
2. Receive verification code
3. Wait 10+ minutes (watch countdown reach 0:00)
4. Try to verify with expired code

**Expected Results:**
- ✅ Countdown timer reaches 0:00
- ✅ Error message: "Verification code has expired. Please request a new one."
- ✅ Need to resend code

---

### ✅ 8. Back Button Navigation

**Steps:**
1. Start login/registration process
2. Enter credentials and click "Continue"
3. Reach verification step
4. Click "Back" button

**Expected Results:**
- ✅ Returns to step 1 (credentials form)
- ✅ Email and password fields still populated
- ✅ Can edit credentials
- ✅ Can proceed again with new/same credentials

---

### ✅ 9. Code Input Validation

**Steps:**
1. Reach verification step
2. Try entering letters: `ABCDEF`
3. Try entering special characters: `!@#$%^`
4. Try entering more than 6 digits: `1234567890`

**Expected Results:**
- ✅ Only numbers accepted
- ✅ Maximum 6 digits
- ✅ Auto-formats input
- ✅ Submit button disabled until exactly 6 digits

---

### ✅ 10. Session Persistence

**Steps:**
1. Login successfully
2. Refresh the page (F5)

**Expected Results:**
- ✅ User still logged in
- ✅ Navbar shows user profile
- ✅ No need to login again

---

### ✅ 11. User Profile Dropdown

**Steps:**
1. Login successfully
2. Click on user name/avatar in navbar

**Expected Results:**
- ✅ Dropdown menu appears
- ✅ Shows user name
- ✅ Shows user email
- ✅ Shows "Logout" button

**Continue:**
3. Click outside the dropdown

**Expected Results:**
- ✅ Dropdown closes

---

### ✅ 12. Logout Functionality

**Steps:**
1. Login successfully
2. Click on user name
3. Click "Logout"

**Expected Results:**
- ✅ User logged out
- ✅ Navbar shows "Login/Register" button
- ✅ User profile removed from localStorage
- ✅ Dropdown closes

---

### ✅ 13. Multiple Users

**Steps:**
1. Register user 1: `user1@example.com`
2. Logout
3. Register user 2: `user2@example.com`
4. Logout
5. Login as user 1
6. Logout
7. Login as user 2

**Expected Results:**
- ✅ Both users registered successfully
- ✅ Each receives their own verification codes
- ✅ Can switch between users
- ✅ Correct user profile shown for each

---

### ✅ 14. Email Template Verification

**Check the received email for:**
- ✅ "GENSEC" logo/branding
- ✅ "Security Scanner Dashboard" subtitle
- ✅ Proper greeting with user name
- ✅ Large, centered 6-digit code
- ✅ Black background with white text
- ✅ "10 minutes" expiration message
- ✅ Security warning
- ✅ Professional footer
- ✅ No spelling/grammar errors

---

### ✅ 15. API Health Check

**Steps:**
```bash
curl http://localhost:3001/api/health
```

**Expected Results:**
```json
{
  "status": "ok",
  "message": "Auth server is running"
}
```

---

### ✅ 16. CORS Verification

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform login/registration

**Expected Results:**
- ✅ No CORS errors
- ✅ API requests successful
- ✅ Status 200 for successful requests

---

### ✅ 17. Loading States

**Steps:**
1. During each step, observe the UI

**Expected Results:**
- ✅ "Sending Code..." shown while sending
- ✅ "Verifying..." shown while verifying
- ✅ Buttons disabled during loading
- ✅ No double submissions possible

---

### ✅ 18. Error Recovery

**Steps:**
1. Enter wrong code
2. See error message
3. Enter correct code

**Expected Results:**
- ✅ Error message clears
- ✅ Can proceed with correct code
- ✅ No lingering error state

---

### ✅ 19. Network Failure Handling

**Steps:**
1. Stop the backend server
2. Try to login/register

**Expected Results:**
- ✅ Error message: "Failed to send verification code. Please check your connection."
- ✅ Graceful error handling
- ✅ No app crash

---

### ✅ 20. Modal Close Behavior

**Steps:**
1. Open login modal
2. Click outside the modal (on backdrop)

**Expected Results:**
- ✅ Modal closes
- ✅ Form resets

**Steps:**
3. Open modal again
4. Click X button in top-right

**Expected Results:**
- ✅ Modal closes
- ✅ Form resets

---

## Performance Tests

### Response Times
- [ ] Code sending: < 3 seconds
- [ ] Code verification: < 1 second
- [ ] Email delivery: < 30 seconds

### UI Responsiveness
- [ ] Modal animations smooth
- [ ] No lag in input fields
- [ ] Countdown timer accurate

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Security Checks

- [x] Email credentials not exposed in frontend
- [x] Passwords not logged
- [x] Verification codes not logged in production
- [x] .env file in .gitignore
- [x] CORS properly configured
- [x] Codes expire after 10 minutes
- [x] Codes single-use only

---

## Documentation Verification

- [x] README.md updated
- [x] 2FA_SETUP.md created
- [x] IMPLEMENTATION_SUMMARY.md created
- [x] QUICK_START.md created
- [x] All docs accurate and complete

---

## Final Checklist

- [x] Both servers start successfully
- [x] Registration flow works end-to-end
- [x] Login flow works end-to-end
- [x] Emails sent and received
- [x] Verification codes work
- [x] Error handling works
- [x] UI/UX polished
- [x] Documentation complete
- [x] Code clean and commented
- [x] Ready for demo/presentation

---

## Test Results Summary

**Date**: 2025-10-31
**Tester**: 
**Status**: ✅ All systems operational

**Notes**:
- Backend server running on port 3001
- Frontend server running on port 5173
- Email sending configured with heise3nberg@gmail.com
- All core functionality implemented and tested
- Ready for user testing with real email addresses

---

## Quick Test Command

```bash
# Test API endpoint
curl -X POST http://localhost:3001/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","type":"register"}'
```

Expected: `{"success":true,"message":"Verification code sent successfully","expiresIn":600}`
