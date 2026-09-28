// api/upload-url.js - Photo/Video upload ke liye Supabase signed URL deta hai
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({error: "Only POST allowed"});
  }
  const { filename, filetype } = req.body;

  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY){
    return res.status(500).json({error: "Supabase keys missing (Vercel env vars check karo)"});
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Filename safe banao (space/special chars hatao)
  const safeName = `${Date.now()}-${filename}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `public/${safeName}`;

  const { data, error } = await supabase
    .storage
    .from('uploads')
    .createSignedUploadUrl(path);

  if(error){
    console.error("Signed URL error:", error);
    return res.status(500).json({error: error.message});
  }

  const { data: pub } = supabase.storage.from('uploads').getPublicUrl(path);

  res.status(200).json({
    uploadUrl: data.signedUrl,
    publicUrl: pub.publicUrl
  });
}
