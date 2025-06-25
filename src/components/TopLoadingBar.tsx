'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { usePathname, useSearchParams } from 'next/navigation';

// This component intercepts fetch requests and shows progress
const TopLoadingBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Listen for route changes
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);
  
  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,  // Disable the spinner
      trickleSpeed: 100,
      minimum: 0.1,
      // Note: height is controlled via CSS
    });
    
    // Keep track of active requests
    let activeRequests = 0;
    
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the fetch function
    window.fetch = async function(...args) {
      // Increment active requests counter
      activeRequests++;
      
      // Start NProgress when first request is made
      if (activeRequests === 1) {
        NProgress.start();
      }
      
      try {
        // Call the original fetch function
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        return Promise.reject(error);
      } finally {
        // Decrement active requests counter
        activeRequests--;
        
        // Complete NProgress when all requests are done
        if (activeRequests === 0) {
          NProgress.done();
        }
      }
    };
    
    // Cleanup function
    return () => {
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, []);
  
  return null;
};

export default TopLoadingBar; 