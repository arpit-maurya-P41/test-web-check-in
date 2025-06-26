'use client';

import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { usePathname, useSearchParams } from 'next/navigation';

// This component intercepts fetch requests and shows progress
const TopLoadingBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRequestsRef = useRef(0);
  
  // Listen for route changes
  useEffect(() => {
    // Only complete if there are no active requests
    if (activeRequestsRef.current === 0) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        NProgress.done();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);
  
  useEffect(() => {
    // Configure NProgress
    NProgress.configure({ 
      showSpinner: false,  // Disable the spinner
      trickleSpeed: 100,
      minimum: 0.1,
      // Note: height is controlled via CSS
    });
    
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the fetch function
    window.fetch = async function(...args) {
      // Increment active requests counter
      activeRequestsRef.current++;
      
      // Start NProgress when first request is made
      if (activeRequestsRef.current === 1) {
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
        activeRequestsRef.current--;
        
        // Complete NProgress when all requests are done
        if (activeRequestsRef.current === 0) {
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