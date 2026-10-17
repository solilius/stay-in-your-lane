// Live stats from GDD.md (build 0.4.36). Speed tiers 1..5 = Very Slow..Very Fast.
const SPEED = ["", "Very Slow", "Slow", "Normal", "Fast", "Very Fast"];

const FACTIONS = {
  herd: {
    name: "The Herd",
    crest: "assets/img/crest-herd.webp",
    blurb: "Farm animals with big muscles and bigger egos. Fewer units, but each one hits hard and refuses to fall over.",
    traits: ["Tanky units", "Raw power", "Long-range artillery"],
    turret: { name: "Cannon Turret", img: "assets/img/turret-herd.webp", text: "Slow, heavy splash cannon." },
    units: [
      { id: "gold-digger", name: "Gold Digger", role: "Miner", cost: 30, hp: 750, atk: 0, range: 0, speed: 5,
        quip: "Only in it for the money. Hauls gold so the rest of the herd gets paid.",
        awk: { name: "Last Resort Plaza", icon: "last-resort", n: 12, text: "Heals itself 10 health every second." } },
      { id: "gym-rat", name: "Gym Rat", role: "Melee", cost: 60, hp: 2200, atk: 200, range: 0.85, speed: 3,
        quip: "Never skips leg day. Or any day. Cheap, tough and always first in line.",
        awk: { name: "Legendairy", icon: "legendairy", n: 10, text: "+1000 max health." } },
      { id: "wash-hog", name: "Wash Hog", role: "Ranged", cost: 90, hp: 1600, atk: 225, range: 5, speed: 2,
        quip: "Throws soap from a safe distance. Squeaky clean, fights dirty.",
        awk: { name: "Pig Out", icon: "snout", n: 10, text: "+20% attack damage." } },
      { id: "black-sheep", name: "Black Sheep", role: "Heavy melee", cost: 150, hp: 4850, atk: 360, range: 1.1, speed: 3,
        quip: "The one the family never talks about. Huge health, hits like a truck.",
        awk: { name: "Battering Ram", icon: "ram", n: 5, text: "Every hit knocks the target back." } },
      { id: "holy-cow", name: "Holy Cow", role: "Artillery", cost: 200, hp: 1850, atk: 340, range: 7, speed: 1,
        quip: "Lobs blessed milk over the front line and splashes everyone nearby.",
        awk: { name: "Bull's Eye", icon: "bulls-eye", n: 5, text: "Range goes up to Sniper." } },
      { id: "high-horse", name: "High Horse", role: "Champion", cost: 250, hp: 6650, atk: 520, range: 1.1, speed: 3,
        quip: "Looks down on everyone, and has the numbers to back it up.",
        awk: { name: "Horsepower", icon: "horse-power", n: 3, text: "Movement speed goes up to Fast." } },
    ],
    spells: [
      { name: "Scapegoat", icon: "scapegoat", mana: 25, text: "Forces nearby enemies to attack one of your units, which takes less damage." },
      { name: "Raining Cats and Dogs", icon: "storm", mana: 45, text: "A storm zone that deals heavy damage to every enemy inside." },
      { name: "Hibernation", icon: "hibernations", mana: 35, text: "Puts one of your units to sleep and heals it a lot." },
    ],
  },
  grove: {
    name: "Verdant Grove",
    crest: "assets/img/crest-grove.webp",
    blurb: "The jungle fights dirty. Cheap, fast units, area damage and tricks that root, burn and turn enemies into frogs.",
    traits: ["Cheap and fast", "Area damage", "Crowd control"],
    turret: { name: "Stinger Turret", img: "assets/img/turret-grove.webp", text: "Fast single-target stinger." },
    units: [
      { id: "busy-bee", name: "Busy Bee", role: "Miner", cost: 30, hp: 750, atk: 0, range: 0, speed: 5,
        quip: "Buzzes between the mine and the base all day. Never takes a break.",
        awk: { name: "Bee Ware", icon: "beehind", n: 15, text: "Takes 50% less damage." } },
      { id: "monkey-business", name: "Monkey Business", role: "Fast melee", cost: 40, hp: 1650, atk: 180, range: 0.85, speed: 4,
        quip: "Fast, cheap, and wearing a suit for no reason at all.",
        awk: { name: "Going Bananas", icon: "bananas", n: 13, text: "+20% attack speed." } },
      { id: "fire-ant", name: "Fire Ant", role: "Ranged splash", cost: 70, hp: 1400, atk: 170, range: 4.5, speed: 3,
        quip: "Small, angry, and armed with firebombs.",
        awk: { name: "Fire Hazard", icon: "fire-hazard", n: 13, text: "Every hit sets the target on fire." } },
      { id: "snake-in-grass", name: "Snake in Grass", role: "Melee", cost: 110, hp: 2650, atk: 250, range: 1.0, speed: 2,
        quip: "You won't see it coming. Loves a critical hit.",
        awk: { name: "Snake Eyes", icon: "snake-eyes", n: 10, text: "Enemies miss it 25% of the time." } },
      { id: "paper-tiger", name: "Paper Tiger", role: "Bruiser", cost: 120, hp: 3900, atk: 295, range: 0.9, speed: 3,
        quip: "Looks scary. Turns out it actually is.",
        awk: { name: "Paper Cut", icon: "papercut", n: 7, text: "Sends 50% of damage taken back to the attacker." } },
      { id: "web-designer", name: "Web Designer", role: "Ranged splash", cost: 160, hp: 2050, atk: 315, range: 7, speed: 2,
        quip: "Builds sticky webs, not websites. Hits groups from far away.",
        awk: { name: "Sticky Situation", icon: "sticky", n: 7, text: "Every hit roots the target for 2 seconds." } },
      { id: "guerrilla-warfare", name: "Guerrilla Warfare", role: "Champion", cost: 210, hp: 6200, atk: 440, range: 1.1, speed: 3,
        quip: "Smashes everything in reach at once. The jungle's final answer.",
        awk: { name: "ApeX", icon: "apex", n: 4, text: "The first hit it takes gives it a 3 second shield." } },
    ],
    spells: [
      { name: "Rooting for You", icon: "rooting-for-you", mana: 30, text: "Roots enemies in an area so they can't walk, and hurts them over time." },
      { name: "Dew Better", icon: "dew-better", mana: 55, text: "A healing zone for every one of your units inside it." },
      { name: "Kissing Frog", icon: "kissing-frog", mana: 30, text: "Turns one enemy into a harmless frog for 8 seconds." },
    ],
  },
};

const MAX = { hp: 6650, atk: 520, range: 7 };

const MODS = [
  { name: "Sudden Death", text: "Every base starts at 1 health." },
  { name: "Apocalypse", text: "5000 gold, 5000 mana and the whole tech tree from the start." },
  { name: "Tech Race", text: "First side to research everything wins." },
  { name: "Mana Rush", text: "First side to reach 500 mana wins." },
  { name: "Awakened", text: "Every unit is awakened from its very first summon." },
  { name: "Frenzy", text: "All cooldowns cut in half." },
];
