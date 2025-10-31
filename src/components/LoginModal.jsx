import { useState } from 'react'

function LoginModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleEmailAuth = (e) => {
    e.preventDefault()
    alert(isLogin ? 'Login functionality will connect to backend' : 'Register functionality will connect to backend')
    onClose()
  }

  const handleGitHubAuth = () => {
    alert('GitHub OAuth will be implemented with backend integration')
    onClose()
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
            {isLogin ? 'Login' : 'Register'}
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mb-4"></div>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white underline transition-colors uppercase tracking-wide"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
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
            className="w-full py-4 bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-white"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400 font-bold uppercase tracking-wide">OR</span>
          </div>
        </div>

        <button 
          onClick={handleGitHubAuth}
          className="w-full py-4 bg-gray-900 border-2 border-gray-800 text-white font-black uppercase tracking-wide hover:bg-gray-800 hover:border-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  )
}

export default LoginModal