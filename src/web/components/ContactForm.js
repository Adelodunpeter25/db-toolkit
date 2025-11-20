'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useContact } from '@/hooks/useContact';
import { createHoneypot } from '@/utils/honeypot';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    username: '',
    phone: ''
  });
  const { submitContact, status, loading } = useContact();
  const honeypotRef = useRef(null);

  useEffect(() => {
    honeypotRef.current = createHoneypot();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = honeypotRef.current?.validate(formData.username, formData.phone);
    if (!validation?.valid) {
      return;
    }
    
    const { username, phone, ...cleanData } = formData;
    const success = await submitContact(cleanData);
    if (success) {
      setFormData({ name: '', email: '', subject: '', message: '', username: '', phone: '' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send Message'}
        <Send size={18} />
      </button>
      
      {status && (
        <p className={`text-center ${status.includes('success') || status.includes('sent') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {status}
        </p>
      )}
    </form>
  );
}
