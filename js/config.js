// ===== BACKEND CONFIG =====
// Yaha apni Supabase details dalo (free hai - supabase.com se milegi)
const BACKEND_CONFIG = {
  SUPABASE_URL: "https://nhluysdpqynbbge1znes.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHV5c2RwcXluYmJnZWl6bmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njk4NzIsImV4cCI6MjEwNjE0NTg3Mn0.CQJa-HG8Q0NJhC8YPSxwoiT1ky0A-g6TG9-FCUbdTSU",
  API_BASE: "/api"
};

// Vercel par deploy ke baad yehi kaam karega
// Local me test karne ke liye API_BASE ko "" rakho
