function About() {
  const offers = [
    {
      title: "Advanced Vulnerability Detection",
      description: "Multi-rule pack scanning with Semgrep, OWASP Top 10, CWE Top 25, and custom security rules. Real-time analysis with comprehensive coverage.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "AI-Powered Remediation",
      description: "Intelligent automated fixing with fallback logic and multi-step fix validation. Automated pull request generation with code fixes.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Multi-Repository Management",
      description: "Unified dashboard for managing security across multiple GitHub repositories. Centralized reporting and analytics.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Comprehensive Reporting",
      description: "Detailed vulnerability reports with history tracking and trend analysis. Export reports in multiple formats.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Enterprise Support",
      description: "Priority email support and dedicated account management for premium users. 24/7 support availability.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Custom Security Rules",
      description: "Create and manage custom Semgrep rules tailored to your organization's security requirements. Rule validation and testing.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Pattern Overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 border-b-2 border-gray-800 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl sm:text-7xl font-black mb-6 uppercase tracking-tighter">
            About Gensec
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade security scanning platform built for organizations that take code security seriously
          </p>
        </div>
      </section>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* What We Do */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-16 bg-gradient-to-b from-white to-gray-400"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">What We Do</h2>
          </div>
          <div className="pl-6">
            <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
              Gensec is an advanced security scanning platform engineered for enterprise environments. 
              We provide comprehensive vulnerability detection and automated remediation capabilities 
              that integrate seamlessly into your development workflow.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6 max-w-4xl">
              Our platform combines cutting-edge AI technology with industry-standard security 
              scanning tools including Semgrep, OWASP Top 10 rules, and custom security rule sets. 
              We deliver real-time vulnerability analysis with actionable remediation strategies.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1 h-16 bg-gradient-to-b from-white to-gray-400"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">What We Offer</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-white via-gray-500 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-8 hover:border-white transition-all duration-300 group relative hover:from-black hover:via-gray-900 hover:to-black"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/10 via-white/5 to-transparent border-2 border-white/20 flex items-center justify-center group-hover:from-white group-hover:via-gray-200 group-hover:to-gray-300 group-hover:border-white transition-all duration-300">
                    <div className="text-white group-hover:text-black transition-colors">
                      {offer.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight group-hover:text-gray-300 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {offer.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-16 bg-gradient-to-b from-white to-gray-400"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">Our Mission</h2>
          </div>
          <div className="pl-6">
            <p className="text-xl text-gray-200 leading-relaxed mb-6 max-w-4xl font-semibold">
              Eliminate security vulnerabilities before they reach production.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">
              We believe that security should be embedded in the development process, not bolted on as an afterthought. 
              Our mission is to make enterprise-grade security scanning accessible, automated, and actionable for 
              development teams of all sizes. We ensure that security vulnerabilities are identified, analyzed, and 
              remediated before they can compromise your systems or expose sensitive data.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-16 bg-gradient-to-b from-white to-gray-400"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">How It Works</h2>
          </div>
          <div className="pl-6">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center font-black text-xl">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-3 uppercase">Integration</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Connect Gensec to your GitHub repositories with one-click integration. Our platform 
                    automatically syncs with your repositories and monitors for changes.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center font-black text-xl">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-3 uppercase">Scanning</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Automated security scans run on every commit and pull request. We analyze your code 
                    using multiple rule packs including Semgrep, OWASP Top 10, and custom rules.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center font-black text-xl">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-3 uppercase">Remediation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    AI-powered fix generation creates pull requests with automated fixes. Review and 
                    approve fixes through your standard code review process, or enable auto-merge for trusted fixes.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 text-black flex items-center justify-center font-black text-xl">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-3 uppercase">Monitoring</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Continuous monitoring tracks vulnerability trends, fix success rates, and security 
                    posture improvements over time. Receive alerts via Slack, Discord, or email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About