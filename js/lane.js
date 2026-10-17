// Tiny playable lane: Herd (you) vs Verdant Grove (CPU). Positions are % of the field width.
(() => {
  const PICKS = {
    herd: [
      { id: "gym-rat", name: "Gym Rat", cost: 60, cd: 1.5, hp: 220, atk: 20, as: 1, range: 6, spd: 7 },
      { id: "wash-hog", name: "Wash Hog", cost: 90, cd: 2.5, hp: 160, atk: 22, as: 1, range: 20, spd: 5.5 },
      { id: "black-sheep", name: "Black Sheep", cost: 150, cd: 3.5, hp: 485, atk: 36, as: .75, range: 7, spd: 7 },
      { id: "high-horse", name: "High Horse", cost: 250, cd: 5, hp: 665, atk: 52, as: .9, range: 7, spd: 7 },
    ],
    grove: [
      { id: "monkey-business", cost: 40, hp: 165, atk: 18, as: 1.1, range: 6, spd: 8 },
      { id: "fire-ant", cost: 70, hp: 140, atk: 17, as: 1, range: 18, spd: 6.5 },
      { id: "paper-tiger", cost: 120, hp: 390, atk: 30, as: 1, range: 6, spd: 7 },
      { id: "guerrilla-warfare", cost: 210, hp: 620, atk: 44, as: .9, range: 7, spd: 7 },
    ],
  };
  const BASE_HP = 1000, BASE_X = { herd: 7, grove: 93 };
  const GOLD_RATE = 13, CPU_RATE = 13, CRIT = .12;

  const field = document.getElementById("field");
  const cardsEl = document.getElementById("miniCards");
  const goldEl = document.getElementById("miniGold");
  const banner = document.getElementById("miniBanner");
  const bases = { herd: field.querySelector(".mini__base--herd"), grove: field.querySelector(".mini__base--grove") };
  const hpBars = { herd: document.getElementById("hpHerd"), grove: document.getElementById("hpGrove") };

  let units, baseHp, gold, cpuGold, cpuNext, cds, running = false, visible = false, last = 0;

  cardsEl.innerHTML = PICKS.herd.map((u, i) => `
    <button class="mini__card" data-i="${i}">
      <img src="assets/img/units/${u.id}.webp" alt="">
      <span>${u.name}</span>
      <small><img src="assets/img/coin.svg" alt="">${u.cost}</small>
      <i class="cd"></i>
    </button>`).join("");
  const cards = [...cardsEl.children];
  cards.forEach(c => c.addEventListener("click", () => summon(+c.dataset.i)));

  function reset() {
    units?.forEach(u => u.el.remove());
    units = [];
    baseHp = { herd: BASE_HP, grove: BASE_HP };
    gold = 120; cpuGold = 40; cpuNext = pickCpu(); cds = PICKS.herd.map(() => 0);
    drawBases(); drawHud();
  }

  function pickCpu() {
    const r = Math.random();
    return PICKS.grove[r < .4 ? 0 : r < .7 ? 1 : r < .9 ? 2 : 3];
  }

  function spawn(side, def) {
    const el = document.createElement("div");
    el.className = `mini__unit ${side}`;
    el.innerHTML = `<i><b></b></i><img src="assets/img/units/${def.id}.webp" alt="">`;
    el.style.bottom = `${30 + Math.random() * 22}px`;
    field.appendChild(el);
    units.push({ side, def, x: BASE_X[side], hp: def.hp, t: 0, el, bar: el.querySelector("b") });
  }

  function summon(i) {
    const def = PICKS.herd[i];
    if (!running || gold < def.cost || cds[i] > 0) return;
    gold -= def.cost; cds[i] = def.cd;
    spawn("herd", def);
  }

  function popNumber(x, bottom, dmg, crit) {
    const n = document.createElement("div");
    n.className = `mini__dmg${crit ? " crit" : ""}`;
    n.textContent = dmg;
    n.style.left = `${x}%`;
    n.style.bottom = `${bottom}px`;
    field.appendChild(n);
    setTimeout(() => n.remove(), 800);
  }

  function shoot(from, toX) {
    const p = document.createElement("div");
    p.className = "mini__proj";
    p.style.left = `${from.x}%`; p.style.bottom = "80px";
    field.appendChild(p);
    requestAnimationFrame(() => { p.style.left = `${toX}%`; p.style.bottom = "60px"; });
    setTimeout(() => p.remove(), 300);
  }

  function hit(attacker, target, targetX) {
    const crit = Math.random() < CRIT;
    const dmg = Math.round(attacker.def.atk * (crit ? 2 : 1) * (0.9 + Math.random() * .2));
    if (attacker.def.range > 10) shoot(attacker, targetX);
    if (target === "base") {
      const side = attacker.side === "herd" ? "grove" : "herd";
      baseHp[side] = Math.max(0, baseHp[side] - dmg);
      const b = bases[side];
      b.style.setProperty("--kx", `${side === "herd" ? -4 : 4}px`);
      b.style.setProperty("--kr", `${side === "herd" ? -2 : 2}deg`);
      b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 90);
      popNumber(targetX, 150, dmg, crit);
    } else {
      target.hp -= dmg;
      popNumber(target.x, 110, dmg, crit);
    }
  }

  function step(dt) {
    gold = Math.min(999, gold + GOLD_RATE * dt);
    cpuGold += CPU_RATE * dt;
    if (cpuGold >= cpuNext.cost) { cpuGold -= cpuNext.cost; spawn("grove", cpuNext); cpuNext = pickCpu(); }
    cds = cds.map(c => Math.max(0, c - dt));

    for (const u of units) {
      const dir = u.side === "herd" ? 1 : -1;
      let best = null, bestD = Infinity;
      for (const o of units) {
        if (o.side === u.side || o.hp <= 0) continue;
        const d = (o.x - u.x) * dir;
        if (d >= -2 && d < bestD) { best = o; bestD = d; }
      }
      const enemyBaseX = BASE_X[u.side === "herd" ? "grove" : "herd"];
      const baseD = (enemyBaseX - u.x) * dir - 4;
      const target = best && bestD <= baseD ? best : "base";
      const d = target === "base" ? baseD : bestD;
      const inRange = d <= u.def.range;
      u.el.classList.toggle("is-fighting", inRange);
      if (inRange) {
        u.t -= dt;
        if (u.t <= 0) { u.t = 1 / u.def.as; hit(u, target, target === "base" ? enemyBaseX : target.x); }
      } else {
        u.x += dir * u.def.spd * dt;
        u.t = Math.min(u.t, .25);
      }
    }

    for (const u of units) {
      if (u.hp > 0) continue;
      u.el.classList.add("dead");
      setTimeout(() => u.el.remove(), 400);
    }
    units = units.filter(u => u.hp > 0);

    if (baseHp.grove <= 0) end("Victory! Stay in your lane.");
    else if (baseHp.herd <= 0) end("The jungle wins this round");
  }

  function drawBases() {
    hpBars.herd.style.width = `${baseHp.herd / BASE_HP * 100}%`;
    hpBars.grove.style.width = `${baseHp.grove / BASE_HP * 100}%`;
  }

  function drawHud() {
    goldEl.textContent = Math.floor(gold);
    cards.forEach((c, i) => {
      const def = PICKS.herd[i];
      c.disabled = !running || gold < def.cost;
      c.querySelector(".cd").style.height = `${cds[i] / def.cd * 100}%`;
    });
  }

  function draw() {
    for (const u of units) {
      u.el.style.left = `${u.x}%`;
      u.bar.style.width = `${Math.max(0, u.hp / u.def.hp) * 100}%`;
    }
    drawBases(); drawHud();
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (visible) { step(dt); draw(); }
    requestAnimationFrame(loop);
  }

  function start() {
    reset();
    banner.hidden = true;
    document.getElementById("miniStart").hidden = true;
    running = true; last = performance.now();
    requestAnimationFrame(loop);
  }

  function end(msg) {
    running = false;
    drawHud();
    document.getElementById("miniMsg").textContent = msg;
    banner.hidden = false;
  }

  document.getElementById("miniStart").addEventListener("click", start);
  document.getElementById("miniAgain").addEventListener("click", start);
  addEventListener("keydown", e => {
    const i = "1234".indexOf(e.key);
    if (i >= 0 && visible) summon(i);
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }, { threshold: .2 }).observe(field);
  reset();
})();
