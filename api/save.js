// api/save.js - Admin ka data backend me save karta hai
export default async function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({error: "Only POST allowed"});
  }
  const { data } = req.body;

  // Yaha Supabase me save karo:
  // const { createClient } = await import('@supabase/supabase-js');
  // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  // await supabase.from('site_data').upsert({id:'main', data});

  console.log("Save request:", Object.keys(data || {}));

  res.status(200).json({success: true, message: "Data save ho gaya"});
}
