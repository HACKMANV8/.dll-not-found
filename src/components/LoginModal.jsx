import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function LoginModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: credentials, 2: verification code
  const [verificationCode, setVerificationCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  const { login, register, sendVerificationCode, verifyCode } = useAuth()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate name for registration
      if (!isLogin && !name.trim()) {
        setError('Name is required')
        setLoading(false)
        return
      }

      // For login, verify credentials first
      if (isLogin) {
        const loginResult = await login(email, password)
        if (!loginResult.success) {
          setError(loginResult.error)
          setLoading(false)
          return
        }
      } else {
        // For registration, check if user exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const userExists = existingUsers.find(u => u.email === email)
        if (userExists) {
          setError('User with this email already exists')
          setLoading(false)
          return
        }
      }

      // Send verification code
      const result = await sendVerificationCode(email, name || email, isLogin ? 'login' : 'register')
      
      if (result.success) {
        setStep(2)
        setCountdown(600) // 10 minutes
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Verify the code
      const result = await verifyCode(email, verificationCode)
      
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Code verified, complete the authentication
      if (isLogin) {
        // Already logged in during step 1, just close
        onClose()
      } else {
        // Complete registration
        const registerResult = await register(name, email, password)
        if (registerResult.success) {
          onClose()
        } else {
          setError(registerResult.error)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    
    try {
      const result = await sendVerificationCode(email, name || email, isLogin ? 'login' : 'register')
      
      if (result.success) {
        setCountdown(600)
        setError('')
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }



  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-black border-2 border-white p-10 w-full max-w-md shadow-2xl animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-all duration-200 text-2xl font-black"
        >
          ×
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
            {step === 1 ? (isLogin ? 'Login' : 'Register') : 'Verify Email'}
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mb-4"></div>
          {step === 1 ? (
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white underline transition-colors uppercase tracking-wide"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          ) : (
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              Enter the 6-digit code sent to {email}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 text-red-200 text-sm font-bold uppercase tracking-wide">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-center text-2xl tracking-widest font-bold"
              />
            </div>

            {countdown > 0 && (
              <div className="text-center text-gray-400 text-sm uppercase tracking-wide">
                Code expires in: <span className="text-white font-bold">{formatTime(countdown)}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-900 text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 border-2 border-gray-800"
              >
                Back
              </button>
              <button 
                type="button"
                onClick={handleResendCode}
                disabled={loading || countdown > 540}
                className="flex-1 py-3 bg-gray-900 text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-all duration-200 border-2 border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-800"></div>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default LoginModal