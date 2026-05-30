import { Link } from 'react-router-dom';
import { 
  Play, 
  Mic2, 
  Headphones, 
  TrendingUp, 
  Users, 
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Music,
  Radio,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PodcastHub</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition">How it Works</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>Trusted by 10,000+ creators</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Stories,
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Amplified</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create, publish, and grow your podcast with professional tools. 
                Join thousands of creators sharing their voice with the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Active Creators</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">50M+</p>
                  <p className="text-sm text-gray-600">Monthly Listeners</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-600">User Rating</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Mic2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Now Playing</p>
                    <p className="text-sm text-gray-400">Tech Innovation Talks</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>12:34</span>
                    <span>18:50</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>
                  <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                    <Play className="w-7 h-7 text-gray-900 ml-1" />
                  </button>
                  <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 18h-2V6h2zm-3.5-6L4 6v12z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Professional tools for podcasters of all levels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Mic2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Recording</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload and publish episodes with our intuitive interface. Support for audio and video formats.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your growth with detailed insights on plays, engagement, and listener demographics.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Distribution</h3>
              <p className="text-gray-600 leading-relaxed">
                Reach listeners worldwide with automatic distribution to all major platforms.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Building</h3>
              <p className="text-gray-600 leading-relaxed">
                Engage with your audience through comments, likes, and subscriber features.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Content Protection</h3>
              <p className="text-gray-600 leading-relaxed">
                Your content is secure with enterprise-grade encryption and admin moderation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Monetization Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Turn your passion into profit with built-in monetization and sponsorship tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Start in Minutes</h2>
            <p className="text-xl text-gray-600">Three simple steps to launch your podcast</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Show</h3>
              <p className="text-gray-600">
                Sign up and set up your podcast profile with name, description, and artwork.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Episodes</h3>
              <p className="text-gray-600">
                Record or upload your content. Add titles, descriptions, and publish instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grow Your Audience</h3>
              <p className="text-gray-600">
                Share your podcast and watch your listener base grow with our analytics tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Creators</h2>
            <p className="text-xl text-gray-600">Join thousands of successful podcasters</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "PodcastHub made it incredibly easy to start my show. The analytics help me understand my audience better."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                  <p className="text-sm text-gray-500">Tech Talk Podcast</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "The best platform for creators. Great features, amazing support, and my audience loves the listening experience."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Davis</p>
                  <p className="text-sm text-gray-500">Startup Stories</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "From zero to 10k listeners in 3 months! The platform's distribution network is unmatched."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  ER
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                  <p className="text-sm text-gray-500">Health & Wellness</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Share Your Voice?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join 10,000+ creators who trust PodcastHub to grow their audience
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition text-lg"
          >
            Start Your Podcast Free
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-sm text-gray-400 mt-6">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">PodcastHub</span>
              </div>
              <p className="text-gray-600 text-sm">
                Empowering creators to share their stories with the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2025 PodcastHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
