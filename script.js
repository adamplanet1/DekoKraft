(() => {
  const topnav = document.getElementById("topnav");
  const menuBtn = document.getElementById("menuBtn");

  if (!topnav || !menuBtn) return;

  menuBtn.addEventListener("click", () => {
    topnav.classList.toggle("open");
  });
})();
