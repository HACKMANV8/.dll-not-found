import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

function NavBar() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const userMenuRef = useRef(null)

  const handleLogoClick = () => {
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b-2 border-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black text-2xl shadow-lg group-hover:bg-gray-200 group-hover:scale-110 transition-all duration-300">
                G
              </div>
              <span className="text-2xl font-black text-white tracking-tighter group-hover:text-gray-300 transition-colors uppercase">
                Gensec
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-gray-300 font-bold hover:text-white transition-colors duration-200 relative group uppercase tracking-wide"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 font-bold hover:text-white transition-colors duration-200 relative group uppercase tracking-wide"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-300 font-bold hover:text-white transition-colors duration-200 relative group uppercase tracking-wide"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-6 py-3 bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 hover:shadow-xl transition-all duration-200 border-2 border-white"
                >
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-black border-2 border-white shadow-xl z-50">
                    <div className="p-4 border-b-2 border-gray-800">
                      <p className="text-white font-bold uppercase tracking-wide text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white font-bold uppercase tracking-wide hover:bg-gray-900 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-3 bg-white text-black font-black uppercase tracking-wide hover:bg-gray-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border-2 border-white"
              >
                Login/Register
              </button>
            )}
          </div>
        </div>
      </nav>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}

export default NavBar