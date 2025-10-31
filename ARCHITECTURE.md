# 🏗️ Architecture - 2-Step Authentication System

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:5173                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ React App
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vite + React)                     │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   LoginModal    │  │   AuthContext    │  │    NavBar      │ │
│  │  - Step 1 Form  │  │  - sendVerify()  │  │  - User Info   │ │
│  │  - Step 2 Code  │  │  - verifyCode()  │  │  - Logout      │ │
│  │  - Validation   │  │  - login()       │  │  - Dropdown    │ │
│  │  - Timer        │  │  - register()    │  │                │ │
│  └─────────────────┘  └──────────────────┘  └────────────────┘ │
│                              │                                    │
│                              │ localStorage                       │
│                              ▼                                    │
│                      ┌──────────────┐                            │
│                      │  User Data   │                            │
│                      │  - id        │                            │
│                      │  - name      │                            │
│                      │  - email     │                            │
│                      └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              │ POST /api/send-verification
                              │ POST /api/verify-code
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express + Node.js)                    │
│                     http://localhost:3001                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                          │  │
│  │                                                            │  │
│  │  POST /api/send-verification                              │  │
│  │  ├─ Validate email                                        │  │
│  │  ├─ Generate 6-digit code                                 │  │
│  │  ├─ Store code in Map (10min expiry)                      │  │
│  │  └─ Send email via Nodemailer                             │  │
│  │                                                            │  │
│  │  POST /api/verify-code                                    │  │
│  │  ├─ Check code exists                                     │  │
│  │  ├─ Verify not expired                                    │  │
│  │  ├─ Match code                                            │  │
│  │  └─ Delete code (one-time use)                            │  │
│  │                                                            │  │
│  │  GET /api/health                                           │  │
│  │  └─ Return server status                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              In-Memory Code Storage (Map)                 │  │
│  │                                                            │  │
│  │  email@example.com → {                                    │  │
│  │    code: "123456",                                        │  │
│  │    expiresAt: 1698765432000,                              │  │
│  │    type: "login"                                          │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Nodemailer                             │  │
│  │  - Gmail SMTP Transport                                   │  │
│  │  - Email: heise3nberg@gmail.com                           │  │
│  │  - App Password: (from .env)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SMTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GMAIL SMTP                               │
│                      smtp.gmail.com:587                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Email Delivery
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S EMAIL                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ From: Gensec Security <heise3nberg@gmail.com>             │ │
│  │ Subject: Your Gensec Login Verification Code              │ │
│  │                                                             │ │
│  │ ┌─────────────────────────────────────────────────────┐   │ │
│  │ │              GENSEC                                  │   │ │
│  │ │      Security Scanner Dashboard                      │   │ │
│  │ │                                                       │   │ │
│  │ │      Your verification code is:                      │   │ │
│  │ │                                                       │   │ │
│  │ │            ┌──────────┐                              │   │ │
│  │ │            │ 123456  │                              │   │ │
│  │ │            └──────────┘                              │   │ │
│  │ │                                                       │   │ │
│  │ │      Expires in 10 minutes                           │   │ │
│  │ └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Registration Flow

```
User                LoginModal          AuthContext         Backend API         Gmail
 │                      │                    │                   │                │
 │  1. Fill Form        │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │  2. Click Continue   │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │                      │ 3. Check if exists │                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │ 4. sendVerifyCode()│                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 5. POST /send-verification         │
 │                      │                    │──────────────────>│                │
 │                      │                    │                   │                │
 │                      │                    │                   │ 6. Generate Code
 │                      │                    │                   │ 7. Store Code  │
 │                      │                    │                   │                │
 │                      │                    │                   │ 8. Send Email  │
 │                      │                    │                   │───────────────>│
 │                      │                    │                   │                │
 │                      │                    │ 9. Success        │                │
 │                      │                    │<──────────────────│                │
 │                      │                    │                   │                │
 │                      │ 10. Show Step 2    │                   │                │
 │                      │<───────────────────│                   │                │
 │                      │                    │                   │                │
 │  11. Receive Email   │                    │                   │                │
 │<─────────────────────────────────────────────────────────────────────────────│
 │                      │                    │                   │                │
 │  12. Enter Code      │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │  13. Click Verify    │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │                      │ 14. verifyCode()   │                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 15. POST /verify-code              │
 │                      │                    │──────────────────>│                │
 │                      │                    │                   │                │
 │                      │                    │                   │ 16. Check Code │
 │                      │                    │                   │ 17. Validate   │
 │                      │                    │                   │ 18. Delete Code│
 │                      │                    │                   │                │
 │                      │                    │ 19. Success       │                │
 │                      │                    │<──────────────────│                │
 │                      │                    │                   │                │
 │                      │ 20. register()     │                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 21. Create User   │                │
 │                      │                    │ 22. Save to localStorage           │
 │                      │                    │ 23. Set User State│                │
 │                      │                    │                   │                │
 │                      │ 24. Close Modal    │                   │                │
 │                      │<───────────────────│                   │                │
 │                      │                    │                   │                │
 │  25. Show Profile    │                    │                   │                │
 │<─────────────────────│                    │                   │                │
```

### Login Flow

```
User                LoginModal          AuthContext         Backend API         Gmail
 │                      │                    │                   │                │
 │  1. Enter Creds      │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │  2. Click Continue   │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │                      │ 3. login()         │                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 4. Validate Creds │                │
 │                      │                    │                   │                │
 │                      │ 5. Success         │                   │                │
 │                      │<───────────────────│                   │                │
 │                      │                    │                   │                │
 │                      │ 6. sendVerifyCode()│                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 7. POST /send-verification         │
 │                      │                    │──────────────────>│                │
 │                      │                    │                   │                │
 │                      │                    │                   │ 8. Send Email  │
 │                      │                    │                   │───────────────>│
 │                      │                    │                   │                │
 │  9. Receive Email    │                    │                   │                │
 │<─────────────────────────────────────────────────────────────────────────────│
 │                      │                    │                   │                │
 │  10. Enter Code      │                    │                   │                │
 │─────────────────────>│                    │                   │                │
 │                      │                    │                   │                │
 │                      │ 11. verifyCode()   │                   │                │
 │                      │───────────────────>│                   │                │
 │                      │                    │                   │                │
 │                      │                    │ 12. POST /verify-code              │
 │                      │                    │──────────────────>│                │
 │                      │                    │                   │                │
 │                      │                    │ 13. Success       │                │
 │                      │                    │<──────────────────│                │
 │                      │                    │                   │                │
 │                      │ 14. Complete Login │                   │                │
 │                      │<───────────────────│                   │                │
 │                      │                    │                   │                │
 │  15. Logged In       │                    │                   │                │
 │<─────────────────────│                    │                   │                │
```

## Component Structure

```
src/
├── App.jsx
│   └── <AuthProvider>                    # Wraps entire app
│       ├── <NavBar>                      # Shows login/profile
│       │   └── <LoginModal>              # Conditional render
│       │       ├── Step 1: Credentials
│       │       └── Step 2: Verification
│       └── <Routes>
│           ├── <Home>
│           ├── <About>
│           └── <Pricing>
│
├── context/
│   └── AuthContext.jsx
│       ├── State: user, loading
│       ├── sendVerificationCode()
│       ├── verifyCode()
│       ├── register()
│       ├── login()
│       └── logout()
│
└── components/
    ├── LoginModal.jsx
    │   ├── State: step, email, password, code, countdown
    │   ├── handleSendCode()
    │   ├── handleVerifyCode()
    │   ├── handleResendCode()
    │   └── formatTime()
    │
    └── NavBar.jsx
        ├── State: showLoginModal, showUserMenu
        ├── User Profile Display
        └── Logout Button
```

## State Management

### AuthContext State
```javascript
{
  user: {
    id: "1698765432000",
    name: "John Doe",
    email: "john@example.com"
  } | null,
  loading: boolean
}
```

### LoginModal State
```javascript
{
  isLogin: boolean,           // true = login, false = register
  step: 1 | 2,               // 1 = credentials, 2 = verification
  email: string,
  password: string,
  name: string,
  verificationCode: string,
  countdown: number,          // seconds remaining
  error: string,
  loading: boolean
}
```

### localStorage
```javascript
{
  "user": {
    "id": "1698765432000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "users": [
    {
      "id": "1698765432000",
      "name": "John Doe",
      "email": "john@example.com",
      "password": "hashedpassword",
      "createdAt": "2025-10-31T08:47:12.000Z"
    }
  ]
}
```

### Backend Code Storage (Map)
```javascript
Map {
  "john@example.com" => {
    code: "123456",
    expiresAt: 1698765432000,
    type: "login"
  }
}
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Frontend Validation              │
│  - Email format                          │
│  - Password required                     │
│  - Name required (register)              │
│  - Code format (6 digits)                │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Credential Verification             │
│  - Check user exists (login)             │
│  - Check user doesn't exist (register)   │
│  - Validate password                     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Email Verification                 │
│  - Send 6-digit code                     │
│  - 10-minute expiration                  │
│  - One-time use                          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Code Verification                │
│  - Match code                            │
│  - Check expiration                      │
│  - Delete after use                      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Session Creation                 │
│  - Store user in localStorage            │
│  - Set user in context                   │
│  - Show user profile                     │
└─────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM 6.20.0** - Routing
- **Vite 5.0.0** - Build tool
- **TailwindCSS 3.4.0** - Styling

### Backend
- **Node.js** - Runtime
- **Express 4.18.2** - Web framework
- **Nodemailer 6.9.7** - Email sending
- **CORS 2.8.5** - Cross-origin requests
- **dotenv 16.3.1** - Environment variables

### Infrastructure
- **Gmail SMTP** - Email delivery
- **localStorage** - Client-side storage
- **In-memory Map** - Code storage (temp)

## Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3001 | http://localhost:3001 |
| Gmail SMTP | 587 | smtp.gmail.com:587 |

## Environment Variables

```bash
# server/.env
HOST_EMAIL=heise3nberg@gmail.com
HOST_EMAIL_PASSWORD=ukwc zxec davc btlm
PORT=3001
```
