import React from "react";
import { Link } from "@tanstack/react-router";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002952] via-[#003c71] to-[#004a8f] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#20d9c5] to-[#60e8d8] bg-clip-text text-transparent leading-tight">
            Invoice Smarter,
            <br />Pay Faster
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Simplify invoicing with our secure, easy-to-use platform powered by TON blockchain
          </p>
          <Link
            to="/counter"
            className="inline-block glass-button text-white font-bold py-4 px-10 rounded-2xl text-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#20d9c5] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Streamline Billing</h3>
            <p className="text-gray-300 leading-relaxed">
              Create and send invoices in seconds
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#20d9c5] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Track Payments</h3>
            <p className="text-gray-300 leading-relaxed">
              Manifor payment status at a glance
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#20d9c5] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Automate Reminders</h3>
            <p className="text-gray-300 leading-relaxed">
              Set automatic follow up for due payments
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#20d9c5] flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Stay Secure</h3>
            <p className="text-gray-300 leading-relaxed">
              Protect your data with advanced encryption
            </p>
          </div>
        </div>

        {/* Demo Section - Two-sided Flow */}
        <div className="glass-card rounded-2xl p-10 mb-12">
          <h2 className="text-4xl font-bold mb-4 text-center">How It Works</h2>
          <p className="text-center text-gray-300 mb-10 text-lg">
            Simple two-step process for freelancers and clients
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Link
              to="/counter"
              className="glass-card p-8 rounded-xl hover:border-[#20d9c5] transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#20d9c5] flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <div className="text-5xl mb-4">👨‍💻</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#20d9c5] transition-colors">Freelancer</h3>
                <p className="text-gray-300 text-base mb-4">Create and send invoices to your clients</p>
                <ul className="text-left text-gray-400 text-sm space-y-2">
                  <li>✓ Fill invoice details</li>
                  <li>✓ Set amount in TON</li>
                  <li>✓ Add client wallet address</li>
                  <li>✓ Track invoice status</li>
                </ul>
              </div>
            </Link>
            <Link
              to="/update-invoice"
              className="glass-card p-8 rounded-xl hover:border-[#20d9c5] transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#20d9c5] flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <div className="text-5xl mb-4">💼</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#20d9c5] transition-colors">Client</h3>
                <p className="text-gray-300 text-base mb-4">Review and pay invoices securely</p>
                <ul className="text-left text-gray-400 text-sm space-y-2">
                  <li>✓ Enter invoice ID</li>
                  <li>✓ Review invoice details</li>
                  <li>✓ Confirm payment amount</li>
                  <li>✓ Pay with TON wallet</li>
                </ul>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400">
          <p className="text-sm">Built with ❤️ for the TON ecosystem</p>
        </div>
      </div>
    </div>
  );
};
