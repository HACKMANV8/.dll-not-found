# 🚀 Quick Start Guide - Gensec Dashboard

## Prerequisites
- Node.js installed
- npm installed
- Internet connection (for sending emails)

## Start the Application

### One Command Start
```bash
./start-all.sh
```

### Or Start Manually

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access the Application

🌐 **Frontend**: http://localhost:5173
🔧 **Backend API**: http://localhost:3001

## Test the 2-Factor Authentication

### 1️⃣ Register a New Account
1. Click **"Login/Register"** button
2. Click **"Don't have an account? Register"**
3. Fill in:
   - Name: Your name
   - Email: **Your real email address**
   - Password: Any password
4. Click **"Continue"**
5. Check your email inbox for verification code
6. Enter the **6-digit code**
7. Click **"Verify & Continue"**
8. ✅ You're logged in!

### 2️⃣ Login with Existing Account
1. Click your name in navbar → **"Logout"**
2. Click **"Login/Register"**
3. Enter your email and password
4. Click **"Continue"**
5. Check your email for new verification code
6. Enter the code
7. Click **"Verify & Continue"**
8. ✅ You're logged in!

## Features to Try

### Resend Code
- Wait 1 minute after receiving code
- Click **"Resend Code"** button
- New code will be sent to your email

### Edit Credentials
- On verification step, click **"Back"**
- Edit your email or password
- Click **"Continue"** again

### Code Expiration
- Codes expire after **10 minutes**
- Timer shows countdown: `9:59 → 0:00`
- Request new code if expired

## Troubleshooting

### Email Not Received?
- Check spam/junk folder
- Verify email address is correct
- Wait 1-2 minutes (email may be delayed)
- Try resending code

### Server Not Starting?
```bash
# Check if ports are in use
lsof -i :3001
lsof -i :5173

# Kill processes if needed
kill -9 <PID>

# Restart servers
./start-all.sh
```

### Dependencies Missing?
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

## Email Configuration

**Sender**: heise3nberg@gmail.com
**Service**: Gmail SMTP
**Config**: `server/.env`

## What You'll Receive

📧 **Verification Email Contains**:
- Gensec branding
- Large 6-digit code (e.g., `123456`)
- Expiration time (10 minutes)
- Security warning

## Quick Commands

```bash
# Start everything
./start-all.sh

# Check server health
curl http://localhost:3001/api/health

# View backend logs
cd server && npm start

# View frontend
open http://localhost:5173
```

## Support

📖 **Detailed Docs**:
- [2FA_SETUP.md](./2FA_SETUP.md) - 2FA technical details
- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - Auth system
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete overview

## Status Indicators

✅ **Both servers running** = Ready to use
🔴 **Backend down** = Can't send verification codes
🔴 **Frontend down** = Can't access UI

---

**Enjoy using Gensec Dashboard! 🎉**
