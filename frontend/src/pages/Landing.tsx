import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left */}
            <div className="flex items-center">
              <img 
                src="/logo_black.png" 
                alt="AngelMed Logo" 
                className="h-18 w-20 object-contain"
              />
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-4xl font-semibold text-gray-900 tracking-wide font-sans">
                AngelMed
              </h1>
            </div>

            {/* Sign Up and Login Buttons - Right */}
            <div className="flex space-x-4">
              <Link 
                to="/signup"
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all"
              >
                Sign Up
              </Link>
              <Link 
                to="/login"
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-all shadow-lg"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm font-semibold text-gray-700">
              Unified Admin Platform for Healthcare Donations
            </span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Every Aspect of Your
            <br />
            <span className="border-b-4 border-gray-900">Donation Program in One Place</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            From donor relationships to medical inventory to financial analytics. AngelMed's 
            comprehensive admin platform gives you complete control over donations, clients, 
            life members, and program performance—all in one unified dashboard.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/signup"
              className="px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Register Your Organization
            </Link>
            <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all">
              Request Demo
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 border-y border-gray-200 py-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">₹500M+</div>
            <div className="text-gray-600 font-medium">Medical Donations Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">150+</div>
            <div className="text-gray-600 font-medium">Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">50,000+</div>
            <div className="text-gray-600 font-medium">Life Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600 font-medium">System Uptime</div>
          </div>
        </div>

        {/* Core Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Six Essential Modules for Complete Control
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage donations, donors, clients, and measure impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Dashboard
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Get a bird's eye view of your entire donation program. Real-time metrics, 
                key performance indicators, and actionable insights at your fingertips.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Real-time KPI monitoring</li>
                <li>✓ Program overview cards</li>
                <li>✓ Quick action widgets</li>
                <li>✓ Customizable layouts</li>
              </ul>
            </div>
            
            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">💊</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Medical Donations
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Comprehensive medicine and medical equipment donation tracking. Manage inventory, 
                expiration dates, batch details, and distribution history with complete accuracy.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Medicine catalog management</li>
                <li>✓ Expiration alerts & lifecycle</li>
                <li>✓ Batch & serial tracking</li>
                <li>✓ Distribution & allocation</li>
              </ul>
            </div>
            
            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Life Members (Donors)
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Manage your entire donor base with comprehensive life member profiles. 
                Track contribution history, engagement, and build lasting relationships.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Donor profile management</li>
                <li>✓ Contribution history</li>
                <li>✓ Engagement tracking</li>
                <li>✓ Verification & compliance</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Clients
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Manage recipient organizations and beneficiary institutions. Track allocation 
                requests, distribution history, and partnership details.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Client/organization profiles</li>
                <li>✓ Allocation requests</li>
                <li>✓ Distribution tracking</li>
                <li>✓ Partnership management</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Donations
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Log and manage all donation transactions. Capture donor details, medical specifications, 
                valuations, and generate tax-compliant receipts instantly.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Donation entry & logging</li>
                <li>✓ Auto-value calculations</li>
                <li>✓ Receipt generation</li>
                <li>✓ Photo documentation</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 p-10 rounded-2xl hover:border-gray-900 hover:shadow-2xl transition-all group">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:underline">
                Analytics
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Data-driven insights into your donation program. Visualize trends, identify patterns, 
                and make informed decisions with comprehensive reporting.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Custom dashboards & charts</li>
                <li>✓ Trend analysis</li>
                <li>✓ Export reports (PDF, Excel)</li>
                <li>✓ Performance metrics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Quick Setup for Admins
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Get your organization's donation platform running in minutes with our streamlined admin setup process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Register Organization</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Create your organization account and verify your admin credentials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Configure Your Program</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Set up organization details, add clients, life members, and configure preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Start Managing</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Log donations, track medical supplies, generate reports, and measure impact.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Streamlined Workflow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From donation receipt to distribution and reporting
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Receive & Log Donations</h3>
                  <p className="text-gray-600">Record medicine donations with donor information, product details, quantities, and valuations using the Donations module.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Track in Inventory</h3>
                  <p className="text-gray-600">Manage medical donations inventory with real-time tracking, batch management, and expiration date monitoring.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Allocate to Clients</h3>
                  <p className="text-gray-600">Manage client requests and allocate medicines to recipient organizations using the Clients module.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Donors</h3>
                  <p className="text-gray-600">Build lasting relationships with life members through the donor management system with contribution tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze & Report</h3>
                  <p className="text-gray-600">Generate insights using the Analytics module to track program performance, trends, and donor engagement metrics.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Monitor Dashboard</h3>
                  <p className="text-gray-600">Stay informed with the comprehensive Dashboard showing real-time KPIs and program health at a glance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-32 max-w-4xl mx-auto text-center border-l-4 border-gray-900 pl-8">
          <p className="text-2xl text-gray-700 italic mb-6 leading-relaxed">
            "AngelMed has transformed our donation management from a manual, error-prone process 
            to an automated system we can rely on. Managing donors, tracking medicines, and reporting 
            has never been easier. Our entire team uses it daily."
          </p>
          <div className="font-semibold text-gray-900 text-lg">Rajesh Kumar</div>
          <div className="text-gray-600">Admin Director, National Health Foundation</div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Donation Management?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join over 150 organizations that trust AngelMed for their complete medicine donation programs
          </p>
          <button 
            className="inline-block px-10 py-4 bg-white text-gray-900 text-lg font-bold rounded-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Register Your Organization →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-24 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex flex-col items-center mb-4">
                <img
                  src="/logo_black.png"
                  alt="AngelMed Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <p className="text-gray-600">
                Unified admin platform for complete medicine donation program management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Organization</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Support</a></li>
                <li><a href="#" className="hover:text-gray-900">Knowledge Base</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-gray-600">© 2024 AngelMed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;