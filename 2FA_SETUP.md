# 2-Step Email Authentication Setup

## Overview
The application now includes 2-step email verification for both login and registration using Gmail SMTP.

## Architecture

### Backend Server (`/server`)
- **Express.js** API server running on port 3001
- **Nodemailer** for sending verification emails via Gmail
- **Endpoints**:
  - `POST /api/send-verification` - Sends 6-digit code to user's email
  - `POST /api/verify-code` - Verifies the code entered by user
  - `GET /api/health` - Health check endpoint

### Frontend Integration
- **AuthContext** - Added `sendVerificationCode()` and `verifyCode()` methods
- **LoginModal** - 2-step flow:
  1. **Step 1**: Enter credentials (name, email, password)
  2. **Step 2**: Enter 6-digit verification code sent to email

## Email Configuration
- **Host Email**: heise3nberg@gmail.com
- **App Password**: Stored in `/server/.env`
- **Service**: Gmail SMTP

## Features

### Security
- ✅ 6-digit random verification codes
- ✅ 10-minute code expiration
- ✅ One-time use codes (deleted after verification)
- ✅ Credential validation before sending code
- ✅ Email-only delivery (no console logging in production)

### User Experience
- ✅ Beautiful HTML email template with Gensec branding
- ✅ Real-time countdown timer (10:00 → 0:00)
- ✅ Resend code functionality (disabled for 1 minute after sending)
- ✅ Back button to edit credentials
- ✅ Auto-format verification code input (numbers only, max 6 digits)
- ✅ Disabled submit until 6 digits entered

## How It Works

### Registration Flow
1. User enters name, email, password
2. System checks if email already exists
3. Sends verification code to email
4. User enters code from email
5. System verifies code
6. Creates user account and logs in

### Login Flow
1. User enters email and password
2. System validates credentials
3. Sends verification code to email
4. User enters code from email
5. System verifies code
6. Logs user in

## Running the Application

### Start Backend Server
```bash
cd server
npm start
```
Server runs on: http://localhost:3001

### Start Frontend
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## Testing

1. **Register a new account**:
   - Click "Login/Register"
   - Switch to "Register"
   - Enter name, valid email, password
   - Click "Continue"
   - Check email for 6-digit code
   - Enter code and click "Verify & Continue"

2. **Login with existing account**:
   - Click "Login/Register"
   - Enter email and password
   - Click "Continue"
   - Check email for 6-digit code
   - Enter code and click "Verify & Continue"

## Email Template
The verification email includes:
- Gensec branding and logo
- Large, centered 6-digit code
- Expiration warning (10 minutes)
- Security warning (never share code)
- Professional black/white design matching app theme

## Environment Variables
Located in `/server/.env`:
```
HOST_EMAIL=heise3nberg@gmail.com
HOST_EMAIL_PASSWORD=ukwc zxec davc btlm
PORT=3001
```

## Security Notes
⚠️ **For Production**:
- Move email credentials to secure environment variables
- Use a dedicated email service (SendGrid, AWS SES, etc.)
- Implement rate limiting on code sending
- Add CAPTCHA to prevent abuse
- Use Redis for code storage instead of in-memory Map
- Implement proper session management with JWT
- Hash passwords before storing
- Add HTTPS/SSL
- Implement IP-based rate limiting

## Current Status
✅ Backend server running on port 3001
✅ Frontend connected and functional
✅ Email sending configured
✅ 2-step verification fully implemented
✅ Both login and registration flows working
