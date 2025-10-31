import PayPalButton from '../components/PayPalButton'

function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      <section className="relative py-20 border-b-2 border-gray-800 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl sm:text-7xl font-black mb-6 uppercase tracking-tighter">
            Pricing
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade security scanning with comprehensive feature sets designed for organizations of all sizes
          </p>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <section>
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="w-1 h-16 bg-gradient-to-b from-white to-gray-400"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">Choose Your Plan</h2>
            <div className="w-1 h-16 bg-gradient-to-b from-gray-400 to-white"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 relative group hover:from-black hover:via-gray-900 hover:to-black flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-8">
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Free</h3>
                <div className="mb-6">
                  <span className="text-6xl font-black">$0</span>
                  <span className="text-xl text-gray-500 font-normal ml-2">/month</span>
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mb-4"></div>
                <p className="text-sm text-gray-400 uppercase font-bold">20% Detection Rate</p>
              </div>
              <ul className="space-y-3 mb-10">
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">5-6 vulnerability types auto-fixed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Automated PR creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">1 repository</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">100 scans/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Community support</span>
                </li>
              </ul>
              <div className="mt-auto">
                <PayPalButton plan="Free" amount={0} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 relative group hover:from-black hover:via-gray-900 hover:to-black flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-8">
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Pro</h3>
                <div className="mb-6">
                  <span className="text-6xl font-black">$29</span>
                  <span className="text-xl text-gray-500 font-normal ml-2">/month</span>
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mb-4"></div>
                <p className="text-sm text-gray-400 uppercase font-bold">70% Detection Rate</p>
              </div>
              <ul className="space-y-3 mb-10">
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">14-15 vulnerability types auto-fixed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Up to 5 repositories</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">500 scans/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Custom security rules</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Priority email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Slack/Discord notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Vulnerability report dashboard</span>
                </li>
              </ul>
              <div className="mt-auto">
                <PayPalButton plan="Pro" amount={29} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-10 hover:border-white transition-all duration-300 relative group hover:from-black hover:via-gray-900 hover:to-black flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-8">
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black">Custom</span>
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mb-4"></div>
                <p className="text-sm text-gray-400 uppercase font-bold">90%+ Detection Rate</p>
              </div>
              <ul className="space-y-3 mb-10">
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">18+ vulnerability types auto-fixed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Unlimited repositories & scans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Dedicated security engineer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">SLA guarantee (99.9% uptime)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">On-premise deployment option</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">
                    <div className="w-5 h-5 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
                      <span className="text-black font-black text-sm">✓</span>
                    </div>
                  </span>
                  <span className="text-gray-300 text-sm">Manual code review (quarterly)</span>
                </li>
              </ul>
              <div className="mt-auto">
                <button 
                  onClick={() => window.location.href = 'mailto:contact@gensec.com?subject=Enterprise%20Plan%20Inquiry'}
                  className="w-full py-4 bg-gradient-to-r from-white via-gray-200 to-white text-black font-black uppercase tracking-wider hover:from-gray-200 hover:via-gray-300 hover:to-gray-200 transition-all duration-200 border-2 border-white shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Pricing