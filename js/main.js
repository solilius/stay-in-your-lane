// Paste your links here. Empty ones stay as "coming soon" buttons.
const LINKS = {
  steam: "",      // https://store.steampowered.com/app/XXXXXXX/Stay_in_Your_Lane/
  demo: "",       // https://lunarsol.itch.io/stay-in-your-lane
  discord: "",    // https://discord.gg/XXXXXXX
  youtube: "",    // full YouTube trailer URL; also replaces the local trailer video
  x: "",          // https://x.com/...
  instagram: "",  // https://instagram.com/...
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// --- Links
$$("[data-link]").forEach(a => {
  const url = LINKS[a.dataset.link];
  if (url) a.href = url;
  else {
    a.href = "#";
    a.dataset.missing = "";
    a.title = "Coming soon";
    a.addEventListener("click", e => e.preventDefault());
  }
});
$$(".socials a[data-missing]").forEach(a => a.remove());

const ytId = (LINKS.youtube.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
if (ytId) {
  $("#tv").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0" title="Stay in Your Lane trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
}

// --- Nav
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();
$("#burger").addEventListener("click", () => $("#navLinks").classList.toggle("is-open"));
$$("#navLinks a").forEach(a => a.addEventListener("click", () => $("#navLinks").classList.remove("is-open")));

// --- Hero logo follows the mouse a little
const heroLogo = $("#heroLogo");
$(".hero").addEventListener("pointermove", e => {
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  heroLogo.style.translate = `${x * 24}px ${y * 18}px`;
});

// --- Ticker of every unit name
const allUnits = [...FACTIONS.herd.units, ...FACTIONS.grove.units];
const tickerHtml = allUnits.map(u => `<span><img src="assets/img/units/${u.id}.webp" alt="">${u.name}</span>`).join("");
$("#ticker").innerHTML = tickerHtml + tickerHtml;

// --- How it plays: auto-advancing steps with one video screen
const steps = $$("#steps li");
const stepVideo = $("#stepVideo");
const STEP_MS = 6000;
let stepIdx = 0, stepStart = 0, stepsVisible = false;

function showStep(i) {
  stepIdx = i;
  steps.forEach((li, j) => {
    li.classList.toggle("is-active", j === i);
    $(".steps__bar", li).style.width = "0";
  });
  stepVideo.src = `assets/video/${steps[i].dataset.video}.mp4`;
  stepVideo.loop = true;
  stepVideo.play().catch(() => {});
  stepStart = performance.now();
}
steps.forEach((li, i) => li.addEventListener("click", () => showStep(i)));
(function tickSteps(now) {
  if (stepsVisible) {
    const t = (now - stepStart) / STEP_MS;
    $(".steps__bar", steps[stepIdx]).style.width = `${Math.min(t, 1) * 100}%`;
    if (t >= 1) showStep((stepIdx + 1) % steps.length);
  } else stepStart = now - (parseFloat($(".steps__bar", steps[stepIdx]).style.width) || 0) / 100 * STEP_MS;
  requestAnimationFrame(tickSteps);
})(0);
new IntersectionObserver(([e]) => {
  stepsVisible = e.isIntersecting;
  stepsVisible ? stepVideo.play().catch(() => {}) : stepVideo.pause();
}, { threshold: .35 }).observe($("#steps"));

// --- Factions and roster
const roster = $("#roster");
const card = $("#unitCard");
let faction = "herd", unit = null, awake = false;

function setFaction(key) {
  faction = key;
  const f = FACTIONS[key];
  roster.dataset.faction = key;
  $$(".side").forEach(b => b.classList.toggle("is-active", b.dataset.faction === key));
  $("#factionBlurb").textContent = f.blurb;
  $("#factionTraits").innerHTML = f.traits.map(t => `<li>${t}</li>`).join("");
  $("#unitGrid").innerHTML = f.units.map(u => `
    <button class="tile" data-id="${u.id}">
      <img src="assets/img/units/${u.id}.webp" alt="">
      <span>${u.name}</span>
      <small><img src="assets/img/coin.svg" alt="">${u.cost}</small>
    </button>`).join("");
  $$("#unitGrid .tile").forEach(t => t.addEventListener("click", () => setUnit(t.dataset.id)));
  $("#spellList").innerHTML = f.spells.map(s => `
    <div class="spell">
      <img src="assets/img/icons/${s.icon}.webp" alt="">
      <div><h4>${s.name}</h4><span class="mana"><img src="assets/img/mana.webp" alt="">${s.mana} mana</span><p>${s.text}</p></div>
    </div>`).join("");
  setUnit(f.units[1].id);
}

function setUnit(id) {
  unit = FACTIONS[faction].units.find(u => u.id === id);
  awake = false;
  $$("#unitGrid .tile").forEach(t => t.classList.toggle("is-active", t.dataset.id === id));
  $("#unitRole").textContent = unit.role;
  $("#unitName").textContent = unit.name;
  $("#unitQuip").textContent = unit.quip;
  $("#awkIcon").src = `assets/img/icons/${unit.awk.icon}.webp`;
  $("#awkN").textContent = unit.awk.n;
  $("#awkName").textContent = unit.awk.name;
  $("#awkText").textContent = unit.awk.text;
  renderUnit();
}

function renderUnit() {
  card.classList.toggle("is-awake", awake);
  $("#awakenBtn").textContent = awake ? "Calm down" : "Awaken!";
  const img = $("#unitImg");
  img.src = `assets/img/units/${unit.id}${awake ? "-awk" : ""}.webp`;
  img.alt = unit.name;
  const p = $(".unit__portrait");
  p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop");

  const miner = unit.atk === 0;
  const rangeLabel = r => r <= 1.1 ? "Melee" : r < 5 ? "Short" : r < 7 ? "Medium" : "Long";
  const rows = [
    ["Health", unit.hp / MAX.hp, unit.hp.toLocaleString("en-US")],
    ["Attack", unit.atk / MAX.atk, miner ? "Doesn't fight" : unit.atk],
    ["Range", miner ? 0 : Math.max(unit.range / MAX.range, .12), miner ? "-" : rangeLabel(unit.range)],
    ["Speed", unit.speed / 5, SPEED[unit.speed]],
  ];
  $("#unitStats").innerHTML = rows.map(([k, , v]) => `<dt>${k}</dt><dd class="bar"><i></i></dd><dd class="val">${v}</dd>`).join("");
  requestAnimationFrame(() => $$("#unitStats .bar i").forEach((b, i) => b.style.width = `${rows[i][1] * 100}%`));
}

$("#awakenBtn").addEventListener("click", () => { awake = !awake; renderUnit(); });
$$(".side").forEach(b => b.addEventListener("click", () => setFaction(b.dataset.faction)));
setFaction("herd");

// --- Game mods as stickers
$("#mods").innerHTML = MODS.map((m, i) => `<div class="mod" style="--r:${[-2, 1.5, -1, 2, -1.5, 1][i]}deg"><h4>${m.name}</h4><p>${m.text}</p></div>`).join("");

// --- Screenshot lightbox
const lb = $("#lightbox");
$$("#shots button").forEach(b => b.addEventListener("click", () => {
  $("img", lb).src = b.dataset.src;
  $("img", lb).alt = $("img", b).alt;
  lb.hidden = false;
}));
lb.addEventListener("click", () => lb.hidden = true);
addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

// --- Reveal on scroll
const revealer = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
}), { threshold: .15 });
$$(".title, .lede, .steps, .versus, .roster, .mode, .mods, .tv, .shots, .mini").forEach(el => {
  el.classList.add("reveal");
  revealer.observe(el);
});
