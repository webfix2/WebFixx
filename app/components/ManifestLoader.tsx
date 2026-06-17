'use client';
import { useEffect } from 'react';

export default function ManifestLoader() {
  useEffect(() => {
    // Attempt to extract loggedInAdmin cookie value
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('loggedInAdmin='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
      const link = document.querySelector('link[rel="manifest"]');
      if (link) {
        link.setAttribute('href', `/manifest.json?token=${encodeURIComponent(token)}`);
      }
    }
  }, []);
  return null;
}
