import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [activeSection, setActiveSection] = useState('hero');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  React.useEffect(() => {
    const sectionIds = ['hero', 'global', 'pricing'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const STEPS = [
    { key: 'scanned', label: 'Received', color: 'bg-[#9ba3af]' },
    { key: 'shipped', label: 'In Transit', color: 'bg-[#5f8783]' },
    { key: 'customs', label: 'Customs', color: 'bg-[#c29d6f]' },
    { key: 'pickup', label: 'Ready for Pickup', matches: ['available_for_pickup', 'payment_under_review'], color: 'bg-[#485c69]' },
    { key: 'completed', label: 'Completed', color: 'bg-[#242e35]' },
  ];

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackId.trim();
    if (!id) return;

    setTracking(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/public/tracking/${encodeURIComponent(id)}`);
      const data = await res.json();

      if (!data.found) {
        setTrackError("Parcel not yet received at warehouse. Please check again once it's scanned in.");
      } else {
        setTrackResult(data);
      }
    } catch (err) {
      setTrackError('Something went wrong. Please try again.');
    } finally {
      setTracking(false);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'scanned') return 0;
    if (status === 'shipped') return 1;
    if (status === 'customs') return 2;
    if (['available_for_pickup', 'payment_under_review'].includes(status)) return 3;
    if (status === 'completed') return 4;
    return 0;
  };

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
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen font-sans bg-white text-zinc-900 selection:bg-teal-600 selection:text-white flex flex-col relative overflow-hidden"
    >
      <style>{`
        @keyframes heroGradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient-bg {
          background: linear-gradient(120deg, #5f8783, #9ba3af, #c29d6f, #485c69, #5f8783);
          background-size: 300% 300%;
          animation: heroGradientShift 12s ease infinite;
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(95,135,131,0.15), rgba(194,157,111,0.1) 40%, transparent 70%)`,
          mixBlendMode: 'multiply',
        }}
      />

      <div className="absolute inset-0 z-0 h-[800px] hero-gradient-bg opacity-[0.08]" />

      <div className="absolute inset-0 z-0 h-[800px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-xl backdrop-saturate-150 border-b border-white/40 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset]">
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
          <a
            href="#global"
            className={`text-sm transition-colors hidden sm:block ${
              activeSection === 'global'
                ? 'font-bold text-zinc-900'
                : 'font-semibold text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Global Reach
          </a>
          
          <a
            href="#pricing"
            className={`text-sm transition-colors hidden sm:block ${
              activeSection === 'pricing'
                ? 'font-bold text-zinc-900'
                : 'font-semibold text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Pricing
          </a>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold text-white transition-all bg-zinc-900 rounded-lg hover:bg-zinc-800 shadow-sm"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      <div className="h-[68px] w-full shrink-0" />

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
          className="w-full max-w-xl mx-auto"
        >
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-lg shadow-zinc-200/50 focus-within:border-[#5f8783] transition-all">
  <input
    type="text"
    value={trackId}
    onChange={(e) => setTrackId(e.target.value)}
    placeholder="Enter your tracking ID"
    className="w-full sm:flex-1 px-4 py-3 text-sm md:text-base border-none focus:outline-none focus:ring-0 text-zinc-900 bg-transparent"
  />
  <button
    type="submit"
    disabled={tracking}
    className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-60 shrink-0"
  >
    {tracking ? 'Locating...' : 'Track'}
  </button>
</form>

          {trackError && (
            <p className="mt-3 text-sm font-medium text-amber-700">{trackError}</p>
          )}
        </motion.div>

        <AnimatePresence>
          {trackResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl mx-auto mt-8 bg-white border border-zinc-200 rounded-xl p-4 md:p-5 shadow-sm text-left"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-zinc-900">Shipment Timeline</h3>
                <span className="text-xs font-medium text-zinc-500">ID: {trackResult.trackingNumber || trackId}</span>
              </div>

              <div className="w-full flex h-2 rounded-full overflow-hidden mb-3 bg-zinc-100/50">
                {STEPS.map((step, i) => {
                  const currentIndex = getStepIndex(trackResult.status);
                  const isDone = i <= currentIndex;
                  return (
                    <motion.div
                      key={step.key}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className={`flex-1 h-full ${isDone ? step.color : 'bg-zinc-100'} transition-colors duration-500`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 border-b border-zinc-100 pb-4">
                {STEPS.map((step, i) => {
                  const currentIndex = getStepIndex(trackResult.status);
                  const isDone = i <= currentIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${step.color} ${!isDone && 'opacity-30'}`} />
                      <span className={`text-xs ${isDone ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Origin</span>
                  <span className="block text-sm font-semibold text-zinc-900">{trackResult.originWarehouseName || 'Processing'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Destination</span>
                  <span className="block text-sm font-semibold text-zinc-900">{trackResult.destinationWarehouseName || 'Awaiting'}</span>
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Details</span>
                      <span className="block text-sm text-zinc-700 line-clamp-2">{trackResult.description || 'Details pending update.'}</span>
                    </div>
                    <div className="text-right pl-4">
                      <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Price</span>
                      <span className="block text-lg font-bold text-teal-700">{trackResult.price != null ? `$${trackResult.price}` : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
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
                <div className="relative w-16 h-16 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-zinc-900 group-hover:shadow-lg group-hover:ring-4 group-hover:ring-zinc-900/5">
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
              <div className="w-16 h-16 rounded-full bg-zinc-100 border-2 border-zinc-200 border-dashed flex items-center justify-center text-zinc-400 text-sm font-bold transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-hover:border-zinc-900 group-hover:text-zinc-900 group-hover:bg-zinc-50">
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
                      <svg key={j} className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
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

      <section id="pricing" className="py-24 text-white relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-zinc-900 bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
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
              className="p-8 rounded-2xl border border-zinc-700 flex flex-col hover:border-zinc-600 transition-colors"
            >
              <h3 className="text-xl font-bold text-zinc-900">Basic</h3>
              <p className="text-sm text-zinc-400 mt-2 h-10">Essential tools for emerging forwarders.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold tracking-tight text-zinc-900">$50</span>
                <span className="text-zinc-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 500 parcels/month', '1 Warehouse location', 'Standard tracking portal', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
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
              className="bg-white p-8 rounded-2xl border-2 border-zinc-900 flex flex-col relative text-zinc-900 transform md:-translate-y-4 shadow-xl"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Pro</h3>
              <p className="text-sm text-zinc-500 mt-2 h-10">Advanced routing and complete capacity.</p>
              <div className="my-6">
                <span className="text-5xl font-extrabold tracking-tight">$150</span>
                <span className="text-zinc-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited parcels', 'Unlimited warehouse locations', 'Custom domain tracking portal', '24/7 Priority support', 'API Access & Webhooks'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
                Upgrade to Pro
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-400 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold tracking-tight mb-4">
              <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              ParcelFlow
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              The high-performance operating system for modern freight forwarders.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#global" className="hover:text-white transition-colors">Global Reach</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-zinc-500">
              &copy; {new Date().getFullYear()} ParcelFlow SaaS. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Twitter</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;