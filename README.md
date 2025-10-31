npm install
npm run dev

## 🔐 2-Step Email Authentication

This project includes email-based 2-factor authentication:

### Quick Start (Both Servers)
```bash
./start-all.sh
```

### Manual Start
```bash
# Terminal 1 - Backend Auth Server
cd server
npm install
npm start

# Terminal 2 - Frontend
npm install
npm run dev
```

### Servers
- **Frontend**: http://localhost:5173
- **Auth API**: http://localhost:3001

### Features
- ✅ Email verification for login & registration
- ✅ 6-digit verification codes
- ✅ 10-minute code expiration
- ✅ Beautiful branded email templates
- ✅ Resend code functionality

See [2FA_SETUP.md](./2FA_SETUP.md) for detailed documentation.
