import { useState, useEffect, useRef } from 'react';
import { UseFetchOptions } from '@/type/types';

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const lastUrlRef = useRef<string>('');
  const isRequestingRef = useRef<boolean>(false);
  
  const fetchData = async () => {
    // Prevent duplicate requests for the same URL
    if (lastUrlRef.current === url && isRequestingRef.current) {
      return;
    }
    
    lastUrlRef.current = url;
    isRequestingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
      
      if (options.body && options.method !== 'GET') {
        requestOptions.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
      isRequestingRef.current = false;
    }
  };
  
  useEffect(() => {
    if (!options.skipOnMount) {
      fetchData();
    }
  }, [url, ...(options.dependencies || [])]);
  
  return { data, loading, error, refetch: fetchData };
} 