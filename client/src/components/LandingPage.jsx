import React from "react";
import { Link } from "react-router-dom";
import { FaBrain, FaFileUpload, FaMicrophone, FaImage, FaSearch, FaShieldAlt, FaRocket } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBrain className="text-3xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Intellica</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30"></div>
            <div className="relative z-10 p-12 md:p-20">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                Intelligent
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Knowledge{" "}
                </span>
                Assistant
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Upload documents, images, or audio files and ask questions in plain language. 
                Get accurate answers with full citation transparency from your personal knowledge base.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 text-lg font-semibold border border-gray-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build and query your intelligent knowledge base
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <FaFileUpload className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Multi-Format Upload</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload documents (PDF, DOCX), images (PNG, JPG), and audio files (MP3, WAV) to build your knowledge base.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                  <FaMicrophone className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Voice Queries</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ask questions using your voice. Our AI transcribes and processes your audio queries instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
                  <FaImage className="text-2xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Image Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload images with text and get intelligent answers based on the visual content and text extraction.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <FaSearch className="text-2xl text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced semantic search that understands context and meaning, not just keywords.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors duration-300">
                  <FaShieldAlt className="text-2xl text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Full Citations</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every answer comes with complete source citations and transparency about where information comes from.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:bg-white/30 transition-all duration-300"></div>
              <div className="relative z-10 p-8 h-full">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors duration-300">
                  <FaRocket className="text-2xl text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Optimized for speed with local processing and efficient vector search for instant responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md rounded-3xl border border-white/30"></div>
            <div className="relative z-10 p-12 md:p-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already building their intelligent knowledge bases with Intellica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Start Your Free Trial
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-all duration-200 text-lg font-semibold border border-gray-200"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaBrain className="text-2xl text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Intellica</h3>
          </div>
          <p className="text-gray-600">
            © 2024 Intellica. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
