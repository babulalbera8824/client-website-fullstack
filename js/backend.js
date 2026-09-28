// ===== FULL STACK SYNC =====
// Ye file tumhari website ko full stack banati hai
// UI me koi change nahi hoga, bas data ab browser ke bajaye backend me save hoga

(function(){
  const CFG = window.BACKEND_CONFIG || { API_BASE: "/api" };
  const PREFIX = "pj_"; // tumhari site ki keys: pj_profile_photo, pj_social etc.

  // 1. Page load par backend se data lao aur localStorage me bharo
  async function loadFromBackend(){
    try{
      const res = await fetch(CFG.API_BASE + "/get-data");
      if(!res.ok) return;
      const json = await res.json();
      if(json && json.data){
        Object.keys(json.data).forEach(k=>{
          try{ localStorage.setItem(k, JSON.stringify(json.data[k])); }catch(e){}
        });
        console.log("Backend se data load ho gaya");
        // React ko refresh karne ke liye event
        window.dispatchEvent(new Event("backend-loaded"));
      }
    }catch(e){
      console.log("Backend load skip, localStorage use hoga", e);
    }
  }

  // 2. localStorage me jab bhi pj_ wala data save ho, backend me bhi bhejo
  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value){
    origSetItem(key, value);
    if(key.startsWith(PREFIX)){
      // debounce karke backend me save karo
      clearTimeout(window._saveT);
      window._saveT = setTimeout(saveToBackend, 800);
    }
  };

  async function saveToBackend(){
    try{
      const data = {};
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && k.startsWith(PREFIX)){
          try{ data[k] = JSON.parse(localStorage.getItem(k)); }catch(e){ data[k]=localStorage.getItem(k); }
        }
      }
      await fetch(CFG.API_BASE + "/save", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({data})
      });
      console.log("Backend me save ho gaya");
    }catch(e){
      console.log("Backend save fail", e);
    }
  }

  // 3. Photo/Video upload ke liye - ab DataURL ki jagah real URL milega
  window.uploadToCloud = async function(file){
    // Pehle backend se upload URL mango
    const res = await fetch(CFG.API_BASE + "/upload-url", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({filename: file.name, filetype: file.type})
    });
    const {uploadUrl, publicUrl} = await res.json();
    // File ko upload karo
    await fetch(uploadUrl, {method:"PUT", body: file, headers:{"Content-Type": file.type}});
    return publicUrl;
  };

  // Start
  loadFromBackend();
})();
