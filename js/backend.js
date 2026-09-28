// Backend sync helper - Supabase se data load/save
// FIX: ab data TURANT save hota hai (pehle tab switch ka wait karta tha)
(function(){
  const CFG = window.BACKEND_CONFIG || {API_BASE:"/api"};

  // Saara pj_ data ikattha karo
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
  function saveToBackend(){
    if(!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return;
    const data = collectData();
    if(!data || Object.keys(data).length === 0) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try{
        await fetch(CFG.API_BASE + "/save", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({data})
        });
        console.log("Backend save OK");
      }catch(e){ console.warn("Backend save fail:", e); }
    }, 800);
  }

  // Load ke dauraan save trigger na ho, isliye flag
  let suppressSave = false;

  // localStorage me jab bhi pj_* key likhi jaye, TURANT backend save trigger karo
  // (pehle sirf tab switch/close par save hota tha - isliye incognito me data nahi dikhta tha)
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
    try{
      const res = await fetch(CFG.API_BASE + "/get-data");
      const {data} = await res.json();
      if(!data || Object.keys(data).length === 0) return;
      suppressSave = true;
      for(const [k, v] of Object.entries(data)){
        try{
          if(localStorage.getItem(k) === null){
            const str = JSON.stringify(v);
            origSetItem(k, str);
            // React ko turant batayo (same tab me storage event fire nahi hota)
            try{
              window.dispatchEvent(new StorageEvent("storage", {key: k, newValue: str}));
            }catch(e){}
          }
        }catch(e){}
      }
      suppressSave = false;
      console.log("Backend load OK");
    }catch(e){ console.warn("Backend load fail:", e); }
  }

  // Page khulne par backend se load karo
  loadFromBackend();

  // Dusre tab me badlaav ho to bhi save karo
  window.addEventListener("storage", (e) => {
    if(e.key && e.key.startsWith("pj_")) saveToBackend();
  });

  // Tab band/change par bhi save karo (backup)
  document.addEventListener("visibilitychange", () => {
    if(document.hidden) saveToBackend();
  });
  window.addEventListener("beforeunload", saveToBackend);

  // Admin panel ke liye global functions
  window.saveToBackend = saveToBackend;
  window.loadFromBackend = loadFromBackend;

  // Video upload ke liye signed URL lo aur file upload karo
  window.uploadToCloud = async function(file){
    if(!file) throw new Error("No file");
    const res = await fetch(CFG.API_BASE + "/upload-url", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({filename: file.name, filetype: file.type})
    });
    const {uploadUrl, publicUrl} = await res.json();
    await fetch(uploadUrl, {
      method:"PUT",
      body: file,
      headers:{"Content-Type": file.type}
    });
    return publicUrl;
  };

  console.log("Backend helper ready (instant save ON)");
})();
