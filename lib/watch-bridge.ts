/**
 * Apple Watch Bridge
 * Provides data and functionality to the Apple Watch companion app
 */

import { Capacitor } from '@capacitor/core';

// Declare global functions for Watch to call
declare global {
  interface Window {
    getRecentDesigns: () => Promise<any[]>;
    getSavedDesigns: () => Promise<any[]>;
    getUserProfile: () => Promise<any>;
  }
}

/**
 * Initialize Watch bridge
 * Exposes functions that the Watch app can call
 */
export function initializeWatchBridge() {
  if (!Capacitor.isNativePlatform()) {
    return; // Only run on native platforms
  }

  // Expose function to get recent designs
  window.getRecentDesigns = async () => {
    try {
      const response = await fetch('/api/looks?limit=10');
      const data = await response.json();
      
      return data.looks?.map((look: any) => ({
        id: look.id,
        title: look.title || 'Untitled Design',
        description: look.description || '',
        imageUrl: look.imageUrl || null,
      })) || [];
    } catch (error) {
      console.error('Error fetching recent designs:', error);
      return [];
    }
  };

  // Expose function to get saved designs
  window.getSavedDesigns = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) return [];
      
      const user = JSON.parse(userStr);
      const response = await fetch(`/api/looks?userId=${user.id}`);
      const data = await response.json();
      
      return data.looks?.map((look: any) => ({
        id: look.id,
        title: look.title || 'Untitled Design',
        description: look.description || '',
        imageUrl: look.imageUrl || null,
      })) || [];
    } catch (error) {
      console.error('Error fetching saved designs:', error);
      return [];
    }
  };

  // Expose function to get user profile
  window.getUserProfile = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        return { user: null, credits: 0 };
      }
      
      const user = JSON.parse(userStr);
      
      // Fetch current credits
      const response = await fetch('/api/user/credits');
      const creditsData = await response.json();
      
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        credits: creditsData.credits || 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { user: null, credits: 0 };
    }
  };

  console.log('Watch bridge initialized');
}

/**
 * Send data to Apple Watch
 */
export async function sendToWatch(data: Record<string, any>) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // This would use the Capacitor plugin we created
    // For now, it's a placeholder
    console.log('Sending to Watch:', data);
  } catch (error) {
    console.error('Error sending to Watch:', error);
  }
}

/**
 * Notify Watch when designs are updated
 */
export async function notifyWatchDesignUpdated(designId: string) {
  await sendToWatch({
    type: 'designUpdated',
    designId,
  });
}

/**
 * Notify Watch when credits change
 */
export async function notifyWatchCreditsUpdated(credits: number) {
  await sendToWatch({
    type: 'creditsUpdated',
    credits,
  });
}
