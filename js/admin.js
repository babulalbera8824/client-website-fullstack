// Admin panel helper - #admin ko aasani se kholne ke liye
(function(){
  // Agar admin.html khola hai to auto #admin lagao
  if(window.location.pathname.includes("admin") && !location.hash){
    location.hash = "#admin";
  }
  console.log("Admin panel ready. URL me #admin lagao: index.html#admin");
})();
