// api/save.js - Admin ka data Supabase me save karta hai
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({error: "Only POST allowed"});
  }
  const { data } = req.body;

  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY){
    return res.status(500).json({success: false, error: "Supabase keys missing (Vercel env vars check karo)"});
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase
    .from('site_data')
    .upsert({ id: 'main', data }, { onConflict: 'id' });

  if(error){
    console.error("Supabase save error:", error);
    return res.status(500).json({success: false, error: error.message});
  }

  res.status(200).json({success: true, message: "Data save ho gaya"});
}
