'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    window.addEventListener('beforeunload', handleStart);
    
    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  if (!loading) return null;
  return <LoadingSpinner />;
}
