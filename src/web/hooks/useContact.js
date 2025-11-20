import { useState } from 'react';

export function useContact() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submitContact = async (formData) => {
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('https://contact-fast.vercel.app/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'adelodunpeter24@gmail.com',
          website_name: 'DB Toolkit',
          website_url: 'https://dbtoolkit.vercel.app',
          ...formData
        })
      });

      const data = await res.json();
      setStatus(data.message || data.detail);
      setLoading(false);
      return res.ok;
    } catch (error) {
      setStatus('Failed to send message. Please try again.');
      setLoading(false);
      return false;
    }
  };

  return { submitContact, status, loading };
}
