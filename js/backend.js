// js/backend.js - v4: folder support + server wins + save suppression
(function(){
  const CFG = window.BACKEND_CONFIG || {API_BASE:"/api"};

  function collectData(){
    const data = {};
    try{
      for(let i=0; i<localStorage.length; i++){
        const k = localStorage.key(i);
        if(k && k.startsWith("pj_")){
          try{ data[k] = JSON.parse(localStorage.getItem(k)); }catch(e){}
        }
      }
    }catch(e){}
    return data;
  }

  let saveTimer = null;
  let suppressSave = false;

  function saveToBackend(){
    if(suppressSave) return;
    if(!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return;
    const data = collectData();
    if(!data || Object.keys(data).length === 0) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      if(suppressSave) return;
      try{
        const r = await fetch(CFG.API_BASE + "/save", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({data})
        });
        const j = await r.json().catch(()=>({}));
        if(r.ok) console.log("Backend save OK");
        else console.warn("Backend save fail:", j);
      }catch(e){ console.warn("Backend save error:", e); }
    }, 800);
  }

  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(k, v){
    const r = origSetItem(k, v);
    if(!suppressSave && typeof k === "string" && k.startsWith("pj_")){
      saveToBackend();
    }
    return r;
  };

  async function loadFromBackend(){
    if(!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return;
    suppressSave = true;
    try{
      const res = await fetch(CFG.API_BASE + "/get-data");
      const {data} = await res.json();
      if(data && Object.keys(data).length > 0){
        for(const [k, v] of Object.entries(data)){
          try{
            const str = JSON.stringify(v);
            origSetItem(k, str);
            try{ window.dispatchEvent(new StorageEvent("storage", {key:k, newValue:str})); }catch(e){}
          }catch(e){}
        }
      }
      console.log("Backend load OK");
    }catch(e){ console.warn("Backend load fail:", e); }
    finally{ suppressSave = false; }
  }

  loadFromBackend();
  window.addEventListener("storage", (e) => {
    if(e.key && e.key.startsWith("pj_")) saveToBackend();
  });
  document.addEventListener("visibilitychange", () => {
    if(document.hidden) saveToBackend();
  });
  window.addEventListener("beforeunload", saveToBackend);

  window.saveToBackend = saveToBackend;
  window.loadFromBackend = loadFromBackend;

  // folder: "reels" | "videos" | "thumbnails" | "public"
  window.uploadToCloud = async function(file, folder){
    if(!file) throw new Error("No file");
    const res = await fetch(CFG.API_BASE + "/upload-url", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({filename: file.name, filetype: file.type, folder: folder || "public"})
    });
    const {uploadUrl, publicUrl} = await res.json();
    if(!uploadUrl) throw new Error("Upload URL nahi mila");
    await fetch(uploadUrl, { method:"PUT", body: file, headers:{"Content-Type": file.type} });
    return publicUrl;
  };

  console.log("Backend helper ready (v4)");
})();
