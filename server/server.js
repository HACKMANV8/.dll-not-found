import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map()

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_EMAIL_PASSWORD
  }
})

// Generate 6-digit verification code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification code endpoint
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email, name, type } = req.body

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' })
    }

    // Generate verification code
    const code = generateCode()
    
    // Store code with 10-minute expiration
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      type
    })

    // Email content
    const mailOptions = {
      from: `"Gensec Security" <${process.env.HOST_EMAIL}>`,
      to: email,
      subject: `Your Gensec ${type === 'register' ? 'Registration' : 'Login'} Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; border-bottom: 2px solid #fff; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
            .content { background-color: #111; border: 2px solid #fff; padding: 30px; }
            .code-box { background-color: #000; border: 2px solid #fff; padding: 20px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #fff; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { color: #ff6b6b; margin-top: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GENSEC</div>
              <p style="margin: 10px 0 0 0; color: #999;">Security Scanner Dashboard</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">Verification Code</h2>
              <p>Hello ${name || 'User'},</p>
              <p>Your verification code for ${type === 'register' ? 'registration' : 'login'} is:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="warning">
                ⚠️ Never share this code with anyone. Gensec will never ask for your verification code.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Gensec. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    console.log(`Verification code sent to ${email}: ${code}`)

    res.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    })

  } catch (error) {
    console.error('Error sending verification email:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email. Please try again.' 
    })
  }
})

// Verify code endpoint
app.post('/api/verify-code', (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and code are required' })
    }

    const stored = verificationCodes.get(email)

    if (!stored) {
      return res.status(400).json({ success: false, error: 'No verification code found. Please request a new one.' })
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email)
      return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' })
    }

    if (stored.code !== code) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please try again.' })
    }

    // Code is valid, remove it
    verificationCodes.delete(email)

    res.json({ success: true, message: 'Verification successful' })

  } catch (error) {
    console.error('Error verifying code:', error)
    res.status(500).json({ success: false, error: 'Verification failed. Please try again.' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`)
})
