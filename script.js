(function(){
  const path = location.pathname.split("/").pop() || "index.html";

  // تمييز الرابط النشط في القائمة
  document.querySelectorAll(".menu a").forEach(a => {
    const href = (a.getAttribute("href") || "").split("?")[0];
    if (href === path) a.classList.add("active");
  });

  // فتح/إغلاق قائمة الموبايل
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("navMenu");

  if (btn && menu){
    btn.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }
})();
