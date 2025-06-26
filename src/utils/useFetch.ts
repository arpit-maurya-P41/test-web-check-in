import { useState, useEffect } from 'react';
import { UseFetchOptions } from '@/type/types';

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = async () => {
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
    }
  };
  
  useEffect(() => {
    if (!options.skipOnMount) {
      fetchData();
    }
  }, options.dependencies || []);
  
  return { data, loading, error, refetch: fetchData };
} 