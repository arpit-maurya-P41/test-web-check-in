'use client';

import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingState, LoadingEvent } from '../type/types';

const TopLoadingBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stateRef = useRef<LoadingState>({
    isLoading: false,
    activeRequests: 0,
    isNavigating: false,
    navigationStartTime: null,
  });
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventsRef = useRef<LoadingEvent[]>([]);

  // Configure NProgress once
  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08,
      easing: 'ease',
      speed: 500,
    });

    // Store original fetch
    originalFetchRef.current = window.fetch;
  }, []);

  // Handle route changes with better timing
  useEffect(() => {
    const currentState = stateRef.current;
    const now = Date.now();
    
    // Start navigation loading
    if (!currentState.isNavigating) {
      currentState.isNavigating = true;
      currentState.navigationStartTime = now;
      NProgress.start();
      
      eventsRef.current.push({
        type: 'navigation',
        timestamp: now,
      });
    }

    // Clear any existing navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Complete navigation after a short delay (allows for page transitions)
    navigationTimeoutRef.current = setTimeout(() => {
      const navigationDuration = currentState.navigationStartTime 
        ? Date.now() - currentState.navigationStartTime 
        : 0;
      
      currentState.isNavigating = false;
      currentState.navigationStartTime = null;
      
      // Only complete if no API requests are active
      if (currentState.activeRequests === 0) {
        NProgress.done();
        
        eventsRef.current.push({
          type: 'complete',
          timestamp: Date.now(),
          duration: navigationDuration,
        });
      }
    }, 150);

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  // Intercept fetch requests with better filtering
  useEffect(() => {
    if (!originalFetchRef.current) return;

    const originalFetch = originalFetchRef.current;
    const currentState = stateRef.current;

    const interceptedFetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      // Skip certain requests that shouldn't trigger loading
      const url = typeof args[0] === 'string' 
        ? args[0] 
        : args[0] instanceof URL 
          ? args[0].href 
          : args[0].url;
      
      const shouldSkip = [
        '/api/auth', // Auth requests
        'chrome-extension://', // Browser extensions
        'moz-extension://', // Firefox extensions
        'safari-extension://', // Safari extensions
        'data:', // Data URLs
        'blob:', // Blob URLs
        'file:', // File URLs
      ].some(skipUrl => url.includes(skipUrl));

      if (shouldSkip) {
        return originalFetch(...args);
      }

      const requestStartTime = Date.now();
      
      // Increment active requests
      currentState.activeRequests++;
      
      // Start loading if not already started
      if (!currentState.isLoading && !currentState.isNavigating) {
        currentState.isLoading = true;
        NProgress.start();
        
        eventsRef.current.push({
          type: 'api',
          timestamp: requestStartTime,
        });
      }

      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        throw error;
      } finally {
        const requestDuration = Date.now() - requestStartTime;
        
        // Decrement active requests
        currentState.activeRequests--;
        
        // Complete loading if no active requests and not navigating
        if (currentState.activeRequests === 0 && !currentState.isNavigating) {
          currentState.isLoading = false;
          NProgress.done();
          
          eventsRef.current.push({
            type: 'complete',
            timestamp: Date.now(),
            duration: requestDuration,
          });
        }
      }
    };

    // Override fetch
    window.fetch = interceptedFetch;

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      NProgress.done();
    };
  }, []);

  return null;
};

export default TopLoadingBar; 