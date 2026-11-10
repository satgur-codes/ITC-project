"use strict";
const P = (id, w, h) => `https://picsum.photos/id/${id}/${w}/${h}`;
// Replace "src" with your club's real photos (e.g. "images/photo1.jpg") and edit names/titles.
const photos = [
  {id:"p1", src:P(1015,900,600), title:"River Bend",       by:"Riya Sharma",  cat:"Landscape",    likes:24},
  {id:"p2", src:P(1025,800,1000),title:"Sleepy Pug",       by:"Kabir Mehta",  cat:"Animals",      likes:41},
  {id:"p3", src:P(1018,900,700), title:"Morning Ridge",    by:"Neha Verma",   cat:"Landscape",    likes:17},
  {id:"p4", src:P(1011,800,1100),title:"Calm Water",       by:"Arjun Rao",    cat:"People",       likes:33},
  {id:"p5", src:P(1020,900,600), title:"Bear at Dusk",     by:"Simran Kaur",  cat:"Animals",      likes:28},
  {id:"p6", src:P(1005,800,1000),title:"Thinking Aloud",   by:"Dev Malhotra", cat:"People",       likes:19},
  {id:"p7", src:P(1035,900,650), title:"Falling Light",    by:"Ishita Jain",  cat:"Landscape",    likes:36},
  {id:"p8", src:P(1024,800,1000),title:"The Watcher",      by:"Rohan Gupta",  cat:"Animals",      likes:22},
  {id:"p9", src:P(1040,900,700), title:"Old Stone Castle", by:"Ananya Singh", cat:"Architecture", likes:30},
  {id:"p10",src:P(1027,800,1100),title:"Window Light",     by:"Meera Nair",   cat:"People",       likes:26},
  {id:"p11",src:P(1036,900,600), title:"First Snow",       by:"Yash Kumar",   cat:"Landscape",    likes:15},
  {id:"p12",src:P(1039,900,700), title:"Quiet Falls",      by:"Tanvi Bose",   cat:"Landscape",    likes:21}
];
const cats = ["All","Landscape","Animals","People","Architecture"];

// Likes are saved per browser so they survive a refresh.
let liked = new Set(), extra = {};
try { liked = new Set(JSON.parse(localStorage.getItem("lensLiked") || "[]")); extra = JSON.parse(localStorage.getItem("lensExtra") || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem("lensLiked", JSON.stringify([...liked])); localStorage.setItem("lensExtra", JSON.stringify(extra)); } catch (e) {} };
photos.forEach(p => { p.likes += extra[p.id] || 0; });

const $ = s => document.querySelector(s);
const grid = $("#grid"), modal = $("#modal");
let filter = "All", current = -1, lastFocus = null;
const visible = () => photos.filter(p => filter === "All" || p.cat === filter);
const heart = on => (on ? "\u2665" : "\u2661");

function likeLabel(p){ return `${heart(liked.has(p.id))} <span>${p.likes}</span>`; }

function toggleLike(p, btn){
  const on = liked.has(p.id);
  on ? (liked.delete(p.id), p.likes--, extra[p.id] = (extra[p.id] || 0) - 1) : (liked.add(p.id), p.likes++, extra[p.id] = (extra[p.id] || 0) + 1);
  save(); render(); syncModal();
  const again = document.querySelector(`[data-like="${p.id}"]`);
  if (again) { again.classList.add("bump"); }
}

function render(){
  grid.innerHTML = "";
  const list = visible();
  $("#empty").hidden = list.length > 0;
  list.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <button class="shot" data-open="${i}" aria-label="Enlarge ${p.title} by ${p.by}">
        <img src="${p.src}" alt="${p.title}, photographed by ${p.by}" loading="lazy">
        <span class="overlay"><b>${p.by}</b><span>${p.title} &middot; ${p.cat}</span></span>
      </button>
      <div class="cap"><span>${p.by}</span>
        <button class="like" data-like="${p.id}" aria-pressed="${liked.has(p.id)}" aria-label="Like ${p.title}">${likeLabel(p)}</button>
      </div>`;
    grid.append(card);
  });
  $("#statPhotos").textContent = photos.length;
  $("#statLikes").textContent = photos.reduce((s, p) => s + p.likes, 0);
}

function renderFilters(){
  const box = $(".filters");
  box.innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === filter}" data-cat="${c}">${c}</button>`).join("");
}

grid.addEventListener("click", e => {
  const like = e.target.closest("[data-like]");
  if (like) return toggleLike(photos.find(p => p.id === like.dataset.like), like);
  const open = e.target.closest("[data-open]");
  if (open) openModal(+open.dataset.open, open);
});
$(".filters").addEventListener("click", e => {
  const c = e.target.closest("[data-cat]"); if (!c) return;
  filter = c.dataset.cat; renderFilters(); render();
});

/* ---------- Modal ---------- */
function syncModal(){
  if (current < 0) return;
  const p = visible()[current]; if (!p) return;
  $("#mImg").src = p.src; $("#mImg").alt = `${p.title}, photographed by ${p.by}`;
  $("#mTitle").textContent = p.title;
  $("#mBy").textContent = `by ${p.by} \u00B7 ${p.cat}`;
  const b = $("#mLike"); b.innerHTML = likeLabel(p); b.setAttribute("aria-pressed", liked.has(p.id));
}
function openModal(i, trigger){
  current = i; lastFocus = trigger || document.activeElement;
  modal.hidden = false; document.body.style.overflow = "hidden";
  syncModal(); $("#mClose").focus();
}
function closeModal(){
  modal.hidden = true; current = -1; document.body.style.overflow = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function step(d){ const n = visible().length; current = (current + d + n) % n; syncModal(); }
$("#mClose").onclick = closeModal;
$("#mPrev").onclick = () => step(-1);
$("#mNext").onclick = () => step(1);
$("#mLike").onclick = () => { const p = visible()[current]; toggleLike(p); };
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => {
  if (modal.hidden) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
  if (e.key === "Tab") { // keep focus inside the modal
    const f = [...modal.querySelectorAll("button")];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- Submit form (client-side only) ---------- */
const form = $("#form"), preview = $("#preview"), statusEl = $("#status");
const rules = {
  name:     v => v.trim().length >= 2 || "Enter your full name (at least 2 characters).",
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email, like name@college.edu.",
  title:    v => v.trim().length >= 2 || "Give your photo a title.",
  category: v => v !== "" || "Choose a category."
};
function setErr(name, msg){
  form.querySelector(`[data-for="${name}"]`).textContent = msg || "";
  form.elements[name].classList.toggle("bad", !!msg);
}
function checkFile(){
  const f = form.elements.photo.files[0];
  if (!f) return "Choose a photo to upload.";
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return "Use a JPG, PNG or WebP image.";
  if (f.size > 5 * 1024 * 1024) return "The photo must be 5 MB or smaller.";
  return "";
}
form.elements.photo.addEventListener("change", () => {
  const msg = checkFile(); setErr("photo", msg);
  const f = form.elements.photo.files[0];
  preview.hidden = !(f && !msg);
  if (f && !msg) preview.src = URL.createObjectURL(f);
});
form.addEventListener("submit", e => {
  e.preventDefault(); statusEl.textContent = "";
  let ok = true;
  for (const k in rules){ const r = rules[k](form.elements[k].value); setErr(k, r === true ? "" : r); if (r !== true) ok = false; }
  const fm = checkFile(); setErr("photo", fm); if (fm) ok = false;
  if (!ok) return form.querySelector(".bad").focus();
  photos.unshift({ id: "u" + Date.now(), src: URL.createObjectURL(form.elements.photo.files[0]),
    title: form.elements.title.value.trim(), by: form.elements.name.value.trim(), cat: form.elements.category.value, likes: 0 });
  filter = "All"; renderFilters(); render();
  form.reset(); preview.hidden = true;
  statusEl.textContent = "Photo added. Scroll up to see it at the top of the gallery.";
});

renderFilters(); render();
