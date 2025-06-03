'use client';

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export async function registerServiceWorker() {
  // Return early if we're on the server
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing registration if available
  if (registrationPromise) {
    return registrationPromise;
  }

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    // Register the service worker
    registrationPromise = navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    const registration = await registrationPromise;

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            console.log('New content is available; please refresh.');
          }
        });
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated');
    });

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    registrationPromise = null;
    return null;
  }
}

export async function unregisterServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service worker unregistered');
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
    }
  }
}

// Helper function to check if service worker is active
export function isServiceWorkerActive(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!navigator.serviceWorker.controller;
}

// Helper function to get service worker registration
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
} 