import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-brand-100 text-brand-900">
      
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-brand-300">
        <div className="text-2xl font-bold tracking-widest uppercase">
          Parcel<span className="text-brand-500">Flow</span>
        </div>
        <div className="flex items-center space-x-8">
          <a href="#about" className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-brand-500">
            About Us
          </a>
          <Link 
            to="/login" 
            className="px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-colors bg-brand-900 rounded-none hover:bg-brand-500"
          >
            Company Admin Login
          </Link>
        </div>
      </nav>

      <section className="px-6 mx-auto mt-24 text-center max-w-5xl">
        <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-wider uppercase text-brand-900">
          Seamless Forwarding from <br/> <span className="text-brand-500">China to Nigeria</span>
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-lg leading-relaxed text-gray-600">
          Manage your shipments, track packages in real-time, and optimize your supply chain with our multi-tenant SaaS platform built for modern businesses.
        </p>
        <Link 
          to="/login" 
          className="px-8 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors shadow-lg bg-brand-500 shadow-brand-300/50 hover:bg-brand-900"
        >
          Access Admin Portal
        </Link>
      </section>

      <section id="about" className="py-24 mt-32 bg-white border-t border-brand-300">
        <div className="px-6 mx-auto text-center max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold tracking-widest uppercase text-brand-900">
            About Our Platform
          </h2>
          <div className="w-24 h-1 mx-auto mb-8 bg-brand-500"></div>
          <p className="text-gray-600 leading-relaxed text-lg">
            We bridge the logistical gap between Chinese suppliers and the Nigerian market. Our platform provides a transparent, efficient, and reliable way for customers to forward parcels, while giving administrators complete control over warehouse inventory and staff management.
          </p>
        </div>
      </section>

      <footer className="py-8 text-center text-white bg-brand-900">
        <p className="text-xs tracking-widest uppercase text-brand-300">
          &copy; {new Date().getFullYear()} ParcelFlow SaaS. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;