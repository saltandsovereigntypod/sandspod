/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL = "YOUR PROJECT URL";
const SUPABASE_ANON_KEY = "YOUR PUBLISHABLE KEY";

/* Create our project client */
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✨ Supabase connected!");
