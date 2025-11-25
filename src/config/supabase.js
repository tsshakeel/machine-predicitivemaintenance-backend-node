import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase env vars. Using mock DB for development/testing.');
  // Full mock with realtime channel support
  supabase = {
    from: (table) => ({
      select: async (columns = '*') => ({ data: [], error: null }),
      insert: async (payload) => ({ data: [{ id: Date.now(), ...payload }], error: null }),
      update: async (updates) => ({ data: [{ ...updates }], error: null }),
      delete: async () => ({ data: [], error: null }),
      eq: (column, value) => ({
        select: async () => ({ data: [], error: null }),
        update: async (updates) => ({ data: [{ ...updates }], error: null }),
        delete: async () => ({ data: [], error: null })
      }),
      order: (column, { ascending = true }) => ({
        select: async () => ({ data: [], error: null })
      })
    }),
    channel: (name) => ({  // Mock realtime channel
      on: (event, filter, callback) => ({
        subscribe: (cb) => {
          // Simulate subscription
          if (cb) cb({ status: 'SUBSCRIBED' });
          // Mock payload trigger (optional: simulate insert after delay)
          setTimeout(() => {
            if (callback) callback({ new: { /* mock data */ } });
          }, 2000);  // Fake event after 2s
          return { unsubscribe: () => console.log('Unsubscribed') };
        }
      })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default supabase;