// api/upload-url.js - v2: folder support (reels/, videos/, thumbnails/)
import { createClient } from '@supabase/supabase-js';

function cleanUrl(u){
  return (u || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}
function cleanFolder(f){
  return (f || "public").trim().replace(/[^a-zA-Z0-9\-_]/g, "") || "public";
}

export default async function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({error: "Only POST allowed"});
  }
  const { filename, filetype, folder } = req.body;
  const url = cleanUrl(process.env.SUPABASE_URL);
  const key = (process.env.SUPABASE_SERVICE_KEY || "").trim();

  if(!url || !key){
    return res.status(500).json({error: "Supabase keys missing (Vercel env vars check karo)"});
  }

  let supabase;
  try{ supabase = createClient(url, key); }
  catch(e){ return res.status(500).json({error: "SUPABASE_URL galat hai: " + e.message}); }

  const safeName = `${Date.now()}-${filename}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${cleanFolder(folder)}/${safeName}`;

  try{
    const { data, error } = await supabase.storage.from('uploads').createSignedUploadUrl(path);
    if(error){
      console.error("Signed URL error:", error);
      return res.status(500).json({error: error.message});
    }
    const { data: pub } = supabase.storage.from('uploads').getPublicUrl(path);
    return res.status(200).json({ uploadUrl: data.signedUrl, publicUrl: pub.publicUrl });
  }catch(e){
    console.error("Supabase connection failed:", e);
    return res.status(500).json({error: "Supabase se connect nahi ho paya: " + e.message});
  }
}
