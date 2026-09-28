// api/get-data.js - Vercel Serverless Function
// Ye backend se website ka data deta hai

export default async function handler(req, res){
  // Yaha Supabase se data lao
  // Abhi ke liye demo data, Supabase key lagane ke baad real data aayega

  // Example Supabase code (comment hatakar use karo):
  // const { createClient } = await import('@supabase/supabase-js');
  // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  // const { data } = await supabase.from('site_data').select('*').eq('id','main').single();

  res.status(200).json({
    data: {
      // "pj_social": [],
      // "pj_profile_photo": null
    },
    message: "Backend connected. Supabase lagane ke baad real data aayega."
  });
}
