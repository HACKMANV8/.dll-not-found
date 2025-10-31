import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-24 sm:py-32 overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm border border-white/20 text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Enterprise Security Platform
            </span>
          </div>
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black mb-6 tracking-tighter leading-none transition-all duration-500 hover:scale-105 hover:bg-gradient-to-r hover:from-white hover:via-gray-300 hover:to-gray-500 hover:bg-clip-text hover:text-transparent cursor-default">
            GENSEC
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-200 uppercase tracking-wide">
            Advanced Security Scanner
          </p>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Enterprise-grade vulnerability detection and automated remediation. Protect your codebase with military-grade security scanning powered by advanced AI and comprehensive rule sets.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/pricing"
              className="px-10 py-4 bg-gradient-to-r from-white to-gray-200 text-black font-bold uppercase tracking-wider hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border-2 border-white shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
            </Link>
            <Link 
              to="/about"
              className="px-10 py-4 border-2 border-white text-white font-bold uppercase tracking-wider bg-gradient-to-r from-transparent to-transparent hover:from-white hover:to-gray-100 hover:text-black transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 uppercase tracking-tight">
              Core Capabilities
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4"></div>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Enterprise security scanning with industry-leading detection and automated remediation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 group relative hover:from-gray-900 hover:to-black">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 flex items-center justify-center group-hover:from-white group-hover:to-gray-200 group-hover:border-white transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Advanced Scanning</h3>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive vulnerability detection using Semgrep rule packs including security-audit, CWE Top 25, and custom security rules.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 group relative hover:from-gray-900 hover:to-black">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 flex items-center justify-center group-hover:from-white group-hover:to-gray-200 group-hover:border-white transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Automated Remediation</h3>
              <p className="text-gray-400 leading-relaxed">
                AI-powered automatic fixing of security vulnerabilities with intelligent fallback logic and multi-step fix sequences.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 group relative hover:from-gray-900 hover:to-black">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 flex items-center justify-center group-hover:from-white group-hover:to-gray-200 group-hover:border-white transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Multi-Repository</h3>
              <p className="text-gray-400 leading-relaxed">
                Manage and scan multiple GitHub repositories from a unified dashboard with centralized reporting and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home