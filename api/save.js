// api/save.js - Admin ka data Supabase me save karta hai
// BULLETPROOF: dono body format accept karta hai
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method!== "POST"){
    return res.status(405).json({success:false, error:"Only POST allowed"});
  }

  if(!process.env.SUPABASE_URL ||!process.env.SUPABASE_SERVICE_KEY){
    return res.status(500).json({success:false, error:"Supabase keys missing (Vercel env vars check karo)"});
  }

  const body = req.body || {};
  let data = null;

  if(body.data && typeof body.data === "object" && Object.keys(body.data).length > 0){
    data = body.data;
  } else {
    data = {};
    for(const k of Object.keys(body)){
      if(typeof k === "string" && k.startsWith("pj_")) data[k] = body[k];
    }
    if(Object.keys(data).length === 0) data = null;
  }

  if(!data){
    return res.status(400).json({success:false, error:"No pj_ data received", receivedKeys:Object.keys(body)});
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
    return res.status(500).json({success:false, error:error.message});
  }

  res.status(200).json({success:true, message:"Data save ho gaya", keys:Object.keys(data)});
}
