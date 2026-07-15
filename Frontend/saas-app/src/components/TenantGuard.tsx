import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export const TenantGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length >= 2 && parts[0] !== 'www') {
      const subdomain = parts[0];
      
      api.get(`/company/by-subdomain/${subdomain}`)
        .then((response) => {
          setTenant(response.data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-brand-900">Loading Portal...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen font-bold text-red-500 text-xl">404 - Company Portal Not Found</div>;
  }

  return <>{children}</>;
};