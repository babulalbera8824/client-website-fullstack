// api/get-data.js - Vercel Serverless Function
// Ye Supabase se website ka data deta hai
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY){
    return res.status(500).json({data: {}, error: "Supabase keys missing (Vercel env vars check karo)"});
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from('site_data')
    .select('data')
    .eq('id', 'main')
    .single();

  // PGRST116 = abhi tak koi row save nahi hui, ye error nahi hai
  if(error && error.code !== 'PGRST116'){
    console.error("Supabase fetch error:", error);
    return res.status(500).json({data: {}, error: error.message});
  }

  res.status(200).json({
    data: (data && data.data) || {},
    message: "Backend connected."
  });
}
