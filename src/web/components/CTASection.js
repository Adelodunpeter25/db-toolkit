'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight, Mail } from 'lucide-react';
import { fadeInUp } from '@/utils/motion';
import { detectPlatform, getDownloadUrl } from '@/utils/detectPlatform';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('/downloads');

  useEffect(() => {
    const platform = detectPlatform();
    if (platform) {
      setDownloadUrl(getDownloadUrl(platform));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Thanks for subscribing!');
    setEmail('');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-600 to-teal-600 dark:from-cyan-700 dark:to-teal-700">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeInUp(0)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={fadeInUp(0.1)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-xl text-white/90 mb-12"
          >
            Download DB Toolkit now and simplify your database workflow
          </motion.p>

          <motion.div
            variants={fadeInUp(0.2)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a
              href={downloadUrl}
              className="group flex items-center gap-2 px-8 py-4 bg-white text-cyan-600 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Download size={20} />
              Download Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/downloads"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 font-semibold"
            >
              View All Platforms
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp(0.3)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <p className="text-white/90 mb-4 text-sm">
              Stay updated with new features and releases
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-cyan-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
            {status && (
              <p className="mt-3 text-white/90 text-sm">{status}</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
