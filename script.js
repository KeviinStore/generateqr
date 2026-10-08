/* ============ KONFIGURASI — ubah bagian ini ============ */
const CONFIG = {
  whatsapp: "6287736023839", // format internasional, tanpa + atau spasi
  greeting: "Halo Ghani, saya lihat portfolio kamu dan ingin berdiskusi soal project.",
  yearsExperience: 2,
  clients: 8,
};

const PROJECTS = [
  { name: "Simulasi Multimeter", url: "https://labmultitester.netlify.app",
    desc: "Situs ini menyediakan simulasi pengoperasian sakelar selektor, penempatan probe (merah & hitam), dan pembacaan hasil ukur pada komponen seperti baterai 9V, aki motor 12V, stopkontak 220V, resistor, serta sekring (kontinuitas).",
    goal: "Memudahkan pemula belajar mengukur tegangan, hambatan, dan kontinuitas secara mandiri tanpa alat fisik." },
  { name: "Quiz Dasar Dasar Komputer", url: "https://cquiez.netlify.app/",
    desc: "Situs ini menyediakan ujian online berdurasi (timer) yang mencakup materi perangkat keras, jaringan, sistem operasi, dan keamanan jaringan, lengkap dengan form data peserta, evaluasi skor/KKM.",
    goal: "Mengukur tingkat pemahaman siswa terhadap materi dasar komputer dan jaringan secara daring." },
  { name: "Am Preset Finder", url: "https://amfinderpreset.netlify.app",
    desc: "Situs ini berfungsi sebagai direktori atau database interaktif yang memudahkan pengguna menemukan berbagai preset Alight Motion (seperti file XML atau tautan impor langsung) berdasarkan kategori, lagu, atau gaya editing.",
    goal: "Membantu para editor video/pembuat konten Alight Motion menemukan preset yang diinginkan dengan cepat tanpa perlu mencari manual satu per satu." },
  { name: "QR Generator", url: "https://qrgenerata.netlify.app/",
    desc: "Situs ini memungkinkan pengguna mengubah berbagai informasi—seperti tautan web, nomor WhatsApp, teks, hingga jaringan Wi-Fi—menjadi kode QR visual. Dilengkapi juga dengan pengaturan kustomisasi seperti warna, ukuran, hingga penambahan logo di tengah kode QR.",
    goal: "Menyediakan sarana praktis bagi pengguna untuk menghasilkan kode QR yang siap dipindai menggunakan kamera HP tanpa aplikasi tambahan." },
];
/* ======================================================== */

const $ = (s, el = document) => el.querySelector(s);
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Statistik & WhatsApp ---------- */
const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.greeting)}`;
$("#waLink").href = waUrl;
$("#waLink2").href = waUrl;
$("#year").textContent = new Date().getFullYear();

$("#stats").innerHTML = [
  [PROJECTS.length, "Project dipamerkan"],
  [CONFIG.clients, "Klien terbantu"],
  [CONFIG.yearsExperience + " th", "Pengalaman"],
].map(([n, l]) => `<div><dd>${n}</dd><dt>${l}</dt></div>`).join("");

/* ---------- Grid project ---------- */
const grid = $("#grid");
PROJECTS.forEach((p, i) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.className = "card";
  btn.type = "button";
  btn.dataset.index = i;
  btn.innerHTML = `
    <span class="name"></span>
    <span class="desc"></span>
    <span class="goal"><b>Tujuan</b> <span></span></span>
    <span class="meta"><span class="open">Pratinjau</span></span>`;
  btn.querySelector(".name").textContent = p.name;       // textContent: aman dari injeksi HTML
  btn.querySelector(".desc").textContent = p.desc;
  btn.querySelector(".goal span").textContent = p.goal;
  li.append(btn);
  grid.append(li);
});
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openModal(PROJECTS[card.dataset.index], card);
});

/* ---------- Router berbasis hash ---------- */
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll("nav a");
const mainEl = $("#main");
const TITLES = { home: "Rahman Abd Ghani — Web Developer", project: "Project — Rahman Abd Ghani" };
let current = null;

// garis bawah menu bergeser ke link yang aktif
const ink = $(".nav-ink");
function moveInk(animate = true) {
  const a = $("nav a.active");
  if (!a) return;
  if (!animate) ink.classList.add("still");
  ink.style.setProperty("--x", a.offsetLeft + "px");
  ink.style.setProperty("--w", a.offsetWidth + "px");
  if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => ink.classList.remove("still")));
}

function show(name) {
  views.forEach((v) => (v.hidden = v.dataset.view !== name));
  navLinks.forEach((a) => {
    const on = a.dataset.route === name;
    a.classList.toggle("active", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  document.title = TITLES[name];
  window.scrollTo(0, 0);
  moveInk(current !== null);   // muat pertama: langsung di tempat, tanpa gerak
  current = name;
}

function route() {
  const name = location.hash.startsWith("#/project") ? "project" : "home";
  if (name === current) return;
  if (current === null) return show(name);   // muat pertama: tanpa transisi
  mainEl.classList.add("leaving");           // crossfade singkat antar halaman
  setTimeout(() => {
    show(name);
    mainEl.classList.remove("leaving");
  }, 140);
}
window.addEventListener("hashchange", route);
route();
// font web bisa mengubah lebar teks setelah dimuat, jadi posisi dihitung ulang
window.addEventListener("resize", () => moveInk(false));
if (document.fonts) document.fonts.ready.then(() => moveInk(false));

/* ---------- Modal preview ---------- */
const modal = $("#modal");
const frame = $("#frame");
const loader = $("#loader");
let lastFocus = null;

function openModal(project, trigger) {
  lastFocus = trigger;
  $("#modalTitle").textContent = project.name;
  $("#modalOpen").href = project.url;

  // modal tumbuh dari posisi card yang diklik
  const r = trigger.getBoundingClientRect();
  modal.style.setProperty("--ox", ((r.left + r.width / 2) / innerWidth) * 100 + "%");
  modal.style.setProperty("--oy", ((r.top + r.height / 2) / innerHeight) * 100 + "%");
  modal.classList.remove("closing");

  frame.classList.remove("ready");
  loader.hidden = false;
  frame.onload = () => { loader.hidden = true; frame.classList.add("ready"); };
  frame.src = project.url;

  modal.hidden = false;
  document.body.classList.add("locked", "modal-open");
  $("#modalClose").focus();
}

function closeModal() {
  if (modal.hidden || modal.classList.contains("closing")) return;
  const finish = () => {
    modal.hidden = true;
    modal.classList.remove("closing");
    frame.src = "about:blank";   // hentikan konten (video/audio) di iframe
    document.body.classList.remove("locked", "modal-open");
    if (lastFocus) lastFocus.focus();
  };
  if (reduceMotion()) return finish();
  modal.classList.add("closing");
  modal.addEventListener("animationend", finish, { once: true });
}

$("#modalClose").addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  // jaga fokus tetap di dalam modal
  if (e.key === "Tab" && !modal.hidden) {
    const f = [...modal.querySelectorAll("a[href], button")];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
