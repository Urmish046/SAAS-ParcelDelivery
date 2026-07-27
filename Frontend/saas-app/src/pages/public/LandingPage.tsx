import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const COUNTRIES = [
    { code: 'cn', name: 'China' },
    { code: 'ng', name: 'Nigeria' },
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'ae', name: 'UAE' },
    { code: 'za', name: 'South Africa' },
    { code: 'ke', name: 'Kenya' },
  ];

  const TESTIMONIALS = [
    {
      quote: "ParcelFlow completely eliminated our warehouse bottlenecks in Guangzhou. The real-time syncing to our Nigerian branches is flawless.",
      author: "David O.",
      role: "Operations Director, LogisTech Africa",
      rating: 5
    },
    {
      quote: "The multi-tenant architecture allowed us to scale from 500 to 5,000 parcels a month without hiring additional administrative staff.",
      author: "Sarah W.",
      role: "CEO, Global Freight Co.",
      rating: 5
    },
    {
      quote: "Switching to the $150 Pro tier was a no-brainer. The custom domain tracking portal instantly elevated our brand trust with end customers.",
      author: "Michael T.",
      role: "Founder, SwiftShip",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-zinc-900 selection:bg-teal-600 selection:text-white flex flex-col relative overflow-hidden">

      <div className="absolute inset-0 z-0 h-[800px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-md shadow-zinc-900/10">
            <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            ParcelFlow
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <a href="#global" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">Global Reach</a>
          <a href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">Pricing</a>
          <Link 
            to="/login" 
            className="px-5 py-2.5 text-sm font-bold text-white transition-all bg-zinc-900 rounded-lg hover:bg-zinc-800 shadow-sm"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 px-6 pt-10 pb-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-bold uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200 rounded-full shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          Enterprise Grade
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mb-6 text-5xl md:text-7xl font-extrabold tracking-tighter text-zinc-900 leading-[1.1]"
        >
          Borderless logistics. <br />
          <span className="text-teal-600">Infinite scale.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mb-10 text-lg md:text-xl text-zinc-500 leading-relaxed font-medium"
        >
          The high-performance operating system for modern freight forwarders. Manage global warehouses, automate customer tracking, and scale your supply chain without the friction.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white transition-all bg-[#74948E] border border-transparent rounded-lg hover:bg-[#65837D] shadow-sm hover:shadow-md"
          >
            Start Forwarding
          </Link>
          <a 
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-zinc-900 transition-all bg-white border border-zinc-200 rounded-lg hover:border-zinc-900 hover:bg-zinc-50 shadow-sm"
          >
            View Pricing
          </a>
        </motion.div>
      </main>

      <section id="global" className="py-20 bg-zinc-50 border-y border-zinc-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-3">Global Infrastructure</h2>
            <h3 className="text-3xl font-bold tracking-tight text-zinc-900 mb-6">
              Routing millions of parcels across borders.
            </h3>
            <p className="max-w-2xl mx-auto text-zinc-500 font-medium mb-16">
              Whether you are consolidating shipments in Guangzhou, clearing customs in Lagos, or delivering last-mile in New York—our platform centralizes your operations across any jurisdiction.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {COUNTRIES.map((country, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-[#74948E] group-hover:shadow-[0_8px_20px_rgb(116,148,142,0.25)] group-hover:ring-4 group-hover:ring-[#74948E]/10">
                  <img 
                    src={`https://flagcdn.com/w160/${country.code}.png`}
                    alt={`${country.name} Flag`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"></div>
                </div>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300">
                  {country.name}
                </span>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: COUNTRIES.length * 0.08 }}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 border-2 border-zinc-200 border-dashed flex items-center justify-center text-zinc-400 text-sm font-bold transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-[#74948E] group-hover:text-teal-700 group-hover:bg-teal-50">
                50+
              </div>
              <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300">
                More
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Trusted by the world's best forwarders
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-colors"
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-[#74948E]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-zinc-700 font-medium leading-relaxed mb-8">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-6">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{t.author}</h4>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-zinc-900 text-white relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-zinc-400">
              Zero hidden fees. Scale your capacity when you are ready.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-800/50 p-8 rounded-2xl border border-zinc-700 flex flex-col hover:border-zinc-600 transition-colors"
            >
              <h3 className="text-xl font-bold text-white">Basic</h3>
              <p className="text-sm text-zinc-400 mt-2 h-10">Essential tools for emerging forwarders.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold tracking-tight">$50</span>
                <span className="text-zinc-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 500 parcels/month', '1 Warehouse location', 'Standard tracking portal', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                    <svg className="w-5 h-5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-zinc-700 text-white font-bold rounded-lg hover:bg-zinc-600 transition-colors">
                Get Started
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl border-2 border-[#74948E] flex flex-col relative text-zinc-900 transform md:-translate-y-4 shadow-xl shadow-[#74948E]/10"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#74948E] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-teal-700">Pro</h3>
              <p className="text-sm text-zinc-500 mt-2 h-10">Advanced routing and complete capacity.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold tracking-tight">$150</span>
                <span className="text-zinc-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited parcels', 'Unlimited warehouse locations', 'Custom domain tracking portal', '24/7 Priority support', 'API Access & Webhooks'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                    <svg className="w-5 h-5 text-[#74948E] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-[#74948E] text-white font-bold rounded-lg hover:bg-[#65837D] transition-colors shadow-sm">
                Upgrade to Pro
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-900 font-bold tracking-tight">
            <div className="w-5 h-5 bg-zinc-900 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#74948E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            ParcelFlow
          </div>
          <p className="text-sm font-medium text-zinc-500">
            &copy; {new Date().getFullYear()} ParcelFlow SaaS. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;