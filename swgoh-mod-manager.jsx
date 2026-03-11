import { useState, useMemo } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MOD_SHAPES = ["Transmitter", "Receiver", "Processor", "Holo-Array", "Data-Bus", "Multiplexer"];
const MOD_SHAPE_SHORT = ["SQ", "AR", "DI", "TR", "CI", "CR"];
const MOD_SHAPE_ICONS = ["◼", "➤", "◆", "▲", "●", "✦"];

const MOD_SETS = [
  { name: "Speed", bonus: "+10% Speed", color: "#00e5ff", icon: "⚡" },
  { name: "Offense", bonus: "+15% Offense", color: "#ff6b35", icon: "⚔" },
  { name: "Defense", bonus: "+25% Defense", color: "#4fc3f7", icon: "🛡" },
  { name: "Health", bonus: "+10% Health", color: "#66bb6a", icon: "♥" },
  { name: "Potency", bonus: "+15% Potency", color: "#ab47bc", icon: "✦" },
  { name: "Tenacity", bonus: "+15% Tenacity", color: "#ffa726", icon: "⚓" },
  { name: "Crit Chance", bonus: "+8% Crit Chance", color: "#ef5350", icon: "🎯" },
  { name: "Crit Damage", bonus: "+30% Crit Damage", color: "#ec407a", icon: "💥" },
];

const PRIMARIES = {
  Transmitter: ["Offense %"],
  Receiver: ["Speed", "Offense %", "Defense %", "Health %", "Potency %", "Tenacity %", "Critical Chance %", "Accuracy %"],
  Processor: ["Offense %", "Defense %", "Health %", "Protection %"],
  "Holo-Array": ["Critical Damage %", "Critical Chance %", "Offense %", "Defense %", "Health %", "Protection %"],
  "Data-Bus": ["Health %", "Protection %"],
  Multiplexer: ["Potency %", "Tenacity %", "Offense %", "Defense %", "Health %", "Protection %"],
};

const TIERS = [
  { label: "E", color: "#9e9e9e" },
  { label: "D", color: "#4caf50" },
  { label: "C", label2: "B", color: "#2196f3" },
  { label: "A", color: "#9c27b0" },
  { label: "★★★★★★", color: "#ffc107" },
];

const TIER_LABELS = ["Grey (E)", "Green (D)", "Blue (C/B)", "Purple (A)", "Gold (6★)"];
const TIER_COLORS = ["#9e9e9e", "#4caf50", "#2196f3", "#9c27b0", "#ffc107"];

// ─── RECOMMENDATIONS DATABASE ─────────────────────────────────────────────────
// Updated for F2P 5.2M GP players — March 2026
// Sources: starwars-fans.com (updated 2025-2026), swgoh.gg top Kyber GAC data
// Priority = META (top GAC teams F2P can build), High (strong supporting/farmable),
//            Medium (solid role-players), Future (newer GL, keep in mind for later)

const RECOMMENDATIONS = [

  // ── GALACTIC LEGENDS (F2P achievable at ~5M GP) ──────────────────────────

  {
    name: "Sith Eternal Emperor",
    tags: ["Sith", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "META",
    sets: ["Speed", "Speed", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Chance %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Health %", "Protection %"],
    speedTarget: 350,
    notes: "Pure speed — SEE's entire kit scales with speed. Pair with Darth Bane (Rule of Two) for maximum power. 350+ speed target. Potency cross helps his debuffs land before DR kicks in.",
  },
  {
    name: "Supreme Leader Kylo Ren",
    tags: ["First Order", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "META",
    sets: ["Speed", "Speed", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Potency %"],
    speedTarget: 330,
    notes: "Speed + offense balance. His kit rewards going first and hitting hard. SLKR is one of the most F2P-friendly GLs to unlock. 330+ speed with strong offense secondaries is the target.",
  },
  {
    name: "Lord Vader",
    tags: ["Sith", "Empire", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "META",
    sets: ["Speed", "Speed", "Potency"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Offense %", "Health %"],
    speedTarget: 320,
    notes: "Potency is crucial — LV needs it to land DoTs reliably. His Imperial Clone team (Cody, Echo, etc.) is very strong in GAC. Potency cross primary is a must. Aim for 85%+ potency total.",
  },
  {
    name: "Jedi Master Luke Skywalker",
    tags: ["Jedi", "Rebel", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "META",
    sets: ["Speed", "Speed", "Crit Damage"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Protection %",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Protection %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Protection %"],
    speedTarget: 310,
    notes: "IMPORTANT: JML uses a Protection arrow (not Speed) — his kit has bonus mechanics based on protection. Protection circle too. Stack speed in secondaries to compensate. Crit Damage triangle.",
  },
  {
    name: "Rey",
    tags: ["Resistance", "Unaligned Force User", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "META",
    sets: ["Speed", "Speed", "Crit Damage"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Critical Damage %"],
    speedTarget: 305,
    notes: "Rey leads the Unaligned Force User (UFU) team with Ben Solo, Cal Kestis, Ezra Exile, and Rey (JT). Speed + CD build. High offense amplifies her Insight-fueled hits. One of the stronger F2P GL options.",
  },
  {
    name: "Jedi Master Kenobi",
    tags: ["Jedi", "Republic", "GL", "F2P Achievable"],
    role: "Support",
    priority: "META",
    sets: ["Speed", "Speed", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Accuracy %",
      Processor: "Health %",
      "Holo-Array": "Critical Chance %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Health %", "Protection %"],
    speedTarget: 330,
    notes: "IMPORTANT: JMK uses an Accuracy arrow — his kit has guaranteed crits built in so speed secondary on the arrow is wasted. Accuracy lets his attacks bypass dodge. Pure 3x Speed sets. His Galactic Republic team (Padmé, GK, CAT, Ahsoka Snips) is excellent in GAC.",
  },
  {
    name: "General Skywalker",
    tags: ["Republic", "Clone", "GL", "F2P Achievable"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Speed", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Offense %", "Critical Chance %"],
    speedTarget: 300,
    notes: "GAS leads the 501st clone team. Potency helps his Isolation debuff land. Serves as both a GL unit and an unlock requirement for JMK. Good F2P investment.",
  },

  // ── SEE / DARTH BANE COMBO ────────────────────────────────────────────────

  {
    name: "Darth Bane",
    tags: ["Sith", "Conquest", "SEE Lifter"],
    role: "Attacker",
    priority: "META",
    sets: ["Health", "Health", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Health %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Health %", "Speed", "Offense %", "Critical Chance %"],
    speedTarget: 260,
    notes: "The most impactful non-GL character in the current meta. Pairs with SEE (Rule of Two) — his base speed is 140 but he passively gains +5 speed per enemy turn up to +100, so starting speed matters less. Health-focused: his damage scales with Max Health. Most top Kyber players run Health sets. Earn via Conquest (F2P).",
  },

  // ── LORD VADER CLONE TEAM ─────────────────────────────────────────────────

  {
    name: "Commander Cody",
    tags: ["Clone", "Empire", "LV Team"],
    role: "Support",
    priority: "High",
    sets: ["Speed", "Speed", "Potency"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Health %",
      "Holo-Array": "Critical Chance %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Health %", "Protection %"],
    speedTarget: 280,
    notes: "Core member of the LV Imperial Clone team. High potency helps his debuffs stick. Speed keeps him active to support LV's turns.",
  },

  // ── JMK GALACTIC REPUBLIC TEAM ───────────────────────────────────────────

  {
    name: "Commander Ahsoka Tano",
    tags: ["Jedi", "Republic", "JMK Team"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Speed", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Critical Damage %"],
    speedTarget: 290,
    notes: "Key attacker in the JMK Republic team. Also an unlock requirement for JMK. Speed + damage build. Her called assists hit very hard when CAT is well-modded.",
  },
  {
    name: "Padmé Amidala",
    tags: ["Republic", "JMK Team", "Support"],
    role: "Support",
    priority: "High",
    sets: ["Speed", "Speed", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Health %",
      Processor: "Health %",
      "Holo-Array": "Protection %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Health %", "Protection %", "Potency %"],
    speedTarget: 275,
    notes: "IMPORTANT: Padmé uses a Health arrow (not Speed) — her Zeta unique gives bonus protection based on health, making it more valuable than a speed primary here. Support/survivability focus in the JMK team.",
  },
  {
    name: "General Kenobi",
    tags: ["Jedi", "Republic", "JMK Team", "Tank"],
    role: "Tank",
    priority: "High",
    sets: ["Health", "Defense", "Defense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Defense %",
      "Holo-Array": "Protection %",
      "Data-Bus": "Health %",
      Multiplexer: "Tenacity %",
    },
    secondaryPriority: ["Speed", "Health %", "Protection %", "Tenacity %"],
    speedTarget: 245,
    notes: "Survivability tank. His unique gives bonus protection on crits, so high health/protection maximizes that. Tenacity helps him avoid debuffs. Core JMK team member.",
  },

  // ── REY UFU TEAM ─────────────────────────────────────────────────────────

  {
    name: "Ben Solo",
    tags: ["Unaligned Force User", "Rey Team"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Speed", "Crit Damage"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Critical Damage %"],
    speedTarget: 285,
    notes: "Hits extremely hard in the UFU team. Speed + crit damage build. His Insight stacks enable Rey's massive damage spikes. Farm from Cantina Battles.",
  },
  {
    name: "Cal Kestis",
    tags: ["Jedi", "Unaligned Force User", "Rey Team"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Speed", "Crit Damage"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Critical Chance %", "Critical Damage %"],
    speedTarget: 275,
    notes: "Excellent Unaligned Force User. Fits into both the Rey UFU team and Jedi teams. Speed + damage build. His fracture ability is powerful utility in GAC.",
  },
  {
    name: "Ezra Bridger (Exile)",
    tags: ["Jedi", "Rebel", "Unaligned Force User", "Rey Team"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Health", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Speed", "Offense %", "Health %", "Critical Chance %"],
    speedTarget: 270,
    notes: "Used in both UFU and Spectre teams. Top Kyber players run Speed+Health sets (over 70% usage). Speed in secondaries is still critical. Solid F2P-farmable unit.",
  },

  // ── INQUISITORIUS (no GL required) ───────────────────────────────────────

  {
    name: "Reva (Third Sister)",
    tags: ["Inquisitor", "Attacker", "No GL Required"],
    role: "Attacker",
    priority: "High",
    sets: ["Speed", "Speed", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Offense %", "Critical Chance %"],
    speedTarget: 290,
    notes: "Best Inquisitor lead. Her Omicron is one of the strongest in the game vs Jedi in GAC. High potency is critical for her Hunted debuff mechanic. Speed + potency balance. Fully F2P farmable.",
  },
  {
    name: "Grand Inquisitor",
    tags: ["Inquisitor", "Tank", "No GL Required"],
    role: "Tank",
    priority: "High",
    sets: ["Health", "Defense", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Defense %",
      "Holo-Array": "Protection %",
      "Data-Bus": "Health %",
      Multiplexer: "Tenacity %",
    },
    secondaryPriority: ["Speed", "Health %", "Protection %", "Tenacity %"],
    speedTarget: 260,
    notes: "Survivability-focused Inquisitor tank. Tenacity helps him resist turn-meter manipulation. Pairs with Reva's team. F2P farmable.",
  },

  // ── SLKR FIRST ORDER TEAM ─────────────────────────────────────────────────

  {
    name: "First Order Stormtrooper",
    tags: ["First Order", "SLKR Team", "Tank"],
    role: "Tank",
    priority: "Medium",
    sets: ["Health", "Defense", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Defense %",
      "Holo-Array": "Protection %",
      "Data-Bus": "Health %",
      Multiplexer: "Tenacity %",
    },
    secondaryPriority: ["Speed", "Health %", "Protection %", "Defense %"],
    speedTarget: 240,
    notes: "Tanks for the SLKR team. Survivability focus. Don't need to be perfectly modded — just durable enough to keep SLKR alive through his Ultimate charge phase.",
  },
  {
    name: "Kylo Ren (Unmasked)",
    tags: ["First Order", "SLKR Team", "Attacker"],
    role: "Attacker",
    priority: "Medium",
    sets: ["Crit Damage", "Crit Damage", "Crit Chance"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Critical Chance %", "Critical Damage %", "Offense %", "Speed"],
    speedTarget: 260,
    notes: "Crit damage attacker in the SLKR team. Get to 85%+ crit chance with the CC set, then stack CD. Less speed-dependent than SLKR himself.",
  },

  // ── BAD BATCH (F2P farmable) ──────────────────────────────────────────────

  {
    name: "Hunter",
    tags: ["Bad Batch", "Clone", "Attacker"],
    role: "Attacker",
    priority: "Medium",
    sets: ["Crit Damage", "Crit Damage", "Crit Chance"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Critical Chance %", "Critical Damage %", "Speed", "Offense %"],
    speedTarget: 265,
    notes: "Bad Batch lead. Crit damage build — his kit rewards critical hits. The 2025-updated Bad Batch team is a solid F2P investment with strong Territory Battle utility.",
  },
  {
    name: "Tech",
    tags: ["Bad Batch", "Clone", "Support"],
    role: "Support",
    priority: "Medium",
    sets: ["Speed", "Potency", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Chance %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Offense %", "Health %"],
    speedTarget: 285,
    notes: "Speed + Potency is the top Kyber choice (51.9% usage per swgoh.gg). Tech's Translation and Target Lock apply rely on potency. Get him moving fast.",
  },
  {
    name: "Wrecker",
    tags: ["Bad Batch", "Clone", "Tank"],
    role: "Tank",
    priority: "Medium",
    sets: ["Health", "Health", "Defense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Defense %",
      "Holo-Array": "Protection %",
      "Data-Bus": "Health %",
      Multiplexer: "Tenacity %",
    },
    secondaryPriority: ["Speed", "Health %", "Protection %", "Defense %"],
    speedTarget: 235,
    notes: "Pure survivability tank for the Bad Batch. High health/protection lets him absorb punishment while the team works. Tenacity helps resist debuffs.",
  },

  // ── COMMANDER LUKE / REBELS ───────────────────────────────────────────────

  {
    name: "Commander Luke Skywalker",
    tags: ["Rebel", "Jedi", "Attacker"],
    role: "Attacker",
    priority: "Medium",
    sets: ["Crit Damage", "Crit Damage", "Crit Chance"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Offense %",
    },
    secondaryPriority: ["Critical Chance %", "Critical Damage %", "Offense %", "Speed"],
    speedTarget: 250,
    notes: "Classic Rebel team leader. Maximize CC to 85%+ then stack CD. Still a solid mid-tier GAC team and easy to farm F2P. Less dominant than before but reliable.",
  },

  // ── DARTH REVAN / MALAK (older but playable) ─────────────────────────────

  {
    name: "Darth Revan",
    tags: ["Sith", "Old Republic", "Support"],
    role: "Support",
    priority: "Medium",
    sets: ["Speed", "Speed", "Speed"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Health %",
      "Holo-Array": "Critical Chance %",
      "Data-Bus": "Health %",
      Multiplexer: "Potency %",
    },
    secondaryPriority: ["Speed", "Potency %", "Health %", "Protection %"],
    speedTarget: 320,
    notes: "Must go first to grant passive buffs before enemies act. Pure speed focus. No longer top meta but still a solid mid-tier GAC defense team. Potency cross helps his debuffs.",
  },
  {
    name: "Darth Malak",
    tags: ["Sith", "Old Republic", "Attacker"],
    role: "Attacker",
    priority: "Medium",
    sets: ["Speed", "Speed", "Offense"],
    primaries: {
      Transmitter: "Offense %",
      Receiver: "Speed",
      Processor: "Offense %",
      "Holo-Array": "Critical Damage %",
      "Data-Bus": "Health %",
      Multiplexer: "Tenacity %",
    },
    secondaryPriority: ["Speed", "Offense %", "Tenacity %", "Critical Chance %"],
    speedTarget: 285,
    notes: "Tenacity cross is important — helps him resist cooldown increases. Pairs with Darth Revan. Still has a place in mid-tier GAC.",
  },
];

const PRIORITY_COLORS = {
  META: "#ffc107",
  High: "#03a9f4",
  Medium: "#66bb6a",
  Low: "#9e9e9e",
};

const ROLE_COLORS = {
  Attacker: "#ef5350",
  Tank: "#42a5f5",
  Support: "#66bb6a",
  Healer: "#ab47bc",
  "Fleet Support": "#ffa726",
};

// ─── STYLES ────────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    background: #030810;
    color: #c8d8e8;
    font-family: 'Rajdhani', sans-serif;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a1628; }
  ::-webkit-scrollbar-thumb { background: #1e4a7a; border-radius: 2px; }

  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px 40px;
  }

  .header {
    text-align: center;
    padding: 32px 0 24px;
    position: relative;
  }

  .header::after {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e6aaa, #00e5ff, #1e6aaa, transparent);
    margin-top: 20px;
  }

  .header-title {
    font-family: 'Orbitron', monospace;
    font-size: clamp(18px, 4vw, 32px);
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: linear-gradient(135deg, #00e5ff, #0080ff, #00e5ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
  }

  .header-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #3a7aaa;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-top: 6px;
  }

  .tabs {
    display: flex;
    gap: 2px;
    background: #050e1c;
    border: 1px solid #0d2a4a;
    border-radius: 4px;
    padding: 3px;
    margin-bottom: 24px;
  }

  .tab {
    flex: 1;
    padding: 10px 8px;
    text-align: center;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    background: transparent;
    color: #3a6a8a;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
  }

  .tab:hover { color: #7ab8d8; background: #0a1e30; }

  .tab.active {
    background: linear-gradient(135deg, #0a2a4a, #0d3560);
    color: #00e5ff;
    box-shadow: 0 0 12px rgba(0,229,255,0.2);
    border: 1px solid #1e4a7a;
  }

  .section-title {
    font-family: 'Orbitron', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #00e5ff;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #0d3560, transparent);
  }

  .card {
    background: linear-gradient(135deg, #050f1e, #081525);
    border: 1px solid #0d2a4a;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }

  .card:hover { border-color: #1e4a7a; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .char-name {
    font-family: 'Orbitron', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #e8f4ff;
    letter-spacing: 0.05em;
  }

  .badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 2px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: bold;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
  }

  .tag {
    background: #0a1e30;
    border: 1px solid #0d2a4a;
    color: #4a8aaa;
    font-size: 10px;
    font-family: 'Share Tech Mono', monospace;
    padding: 1px 6px;
    border-radius: 2px;
    letter-spacing: 0.1em;
  }

  .mod-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin: 10px 0;
  }

  @media (min-width: 600px) {
    .mod-grid { grid-template-columns: repeat(6, 1fr); }
  }

  .mod-slot {
    background: #030d1c;
    border: 1px solid #0d2a4a;
    border-radius: 4px;
    padding: 6px;
    text-align: center;
  }

  .mod-slot-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px;
    color: #3a5a7a;
    letter-spacing: 0.1em;
    margin-bottom: 3px;
  }

  .mod-slot-icon {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .mod-slot-primary {
    font-size: 9px;
    color: #00e5ff;
    font-family: 'Share Tech Mono', monospace;
  }

  .priority-list {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .priority-item {
    display: flex;
    align-items: center;
    gap: 3px;
    background: #030d1c;
    border: 1px solid #0d2a4a;
    border-radius: 2px;
    padding: 2px 8px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: #7ab0d0;
  }

  .priority-rank {
    color: #3a6a8a;
    font-weight: bold;
    min-width: 14px;
  }

  .speed-target {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #051525;
    border: 1px solid #0d4a3a;
    border-radius: 3px;
    padding: 4px 10px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #00e5c0;
    margin-top: 8px;
  }

  .notes-box {
    background: #040d1a;
    border-left: 2px solid #0d3560;
    padding: 8px 12px;
    margin-top: 8px;
    font-size: 12px;
    color: #6a9ab8;
    line-height: 1.5;
    border-radius: 0 3px 3px 0;
  }

  .set-boxes {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin: 8px 0;
  }

  .set-box {
    font-size: 10px;
    font-family: 'Share Tech Mono', monospace;
    padding: 3px 8px;
    border-radius: 2px;
    border: 1px solid;
    letter-spacing: 0.1em;
  }

  .search-bar {
    width: 100%;
    background: #050f1e;
    border: 1px solid #0d2a4a;
    border-radius: 4px;
    padding: 10px 14px;
    color: #c8d8e8;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    outline: none;
    margin-bottom: 16px;
    transition: border-color 0.2s;
  }

  .search-bar:focus { border-color: #1e4a7a; box-shadow: 0 0 8px rgba(0,100,200,0.2); }
  .search-bar::placeholder { color: #2a4a6a; }

  .filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .filter-btn {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 2px;
    border: 1px solid #0d2a4a;
    background: #050f1e;
    color: #4a7a9a;
    cursor: pointer;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.15s;
  }

  .filter-btn:hover { border-color: #1e4a7a; color: #7ab8d8; }
  .filter-btn.active { background: #0a2a4a; border-color: #00e5ff; color: #00e5ff; }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  @media (min-width: 600px) {
    .form-grid { grid-template-columns: 1fr 1fr 1fr; }
  }

  .form-field { display: flex; flex-direction: column; gap: 4px; }

  .form-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    color: #3a6a8a;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .form-input, .form-select {
    background: #030d1c;
    border: 1px solid #0d2a4a;
    border-radius: 3px;
    padding: 7px 10px;
    color: #c8d8e8;
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }

  .form-input:focus, .form-select:focus { border-color: #1e5a8a; }
  .form-select option { background: #050f1e; }

  .btn {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 9px 18px;
    border-radius: 3px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-primary {
    background: linear-gradient(135deg, #0a3a6a, #0d4a88);
    color: #00e5ff;
    border: 1px solid #1e5aaa;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #0d4a88, #1060aa);
    box-shadow: 0 0 12px rgba(0,150,255,0.3);
  }

  .btn-danger {
    background: #1a0808;
    color: #ff5252;
    border: 1px solid #4a1010;
    font-size: 9px;
    padding: 4px 10px;
  }

  .btn-danger:hover { background: #2a1010; }

  .btn-sm {
    font-size: 9px;
    padding: 5px 10px;
    background: #050f1e;
    color: #3a8aaa;
    border: 1px solid #0d2a4a;
  }

  .btn-sm:hover { border-color: #1e4a7a; color: #7ab8d8; }

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid #0a1e30;
    font-size: 12px;
  }

  .stat-label { color: #5a8aaa; font-family: 'Share Tech Mono', monospace; font-size: 10px; }
  .stat-value { color: #c8d8e8; font-family: 'Share Tech Mono', monospace; }
  .stat-value.highlight { color: #00e5ff; }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #2a4a6a;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .empty-state-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }

  .roster-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  @media (min-width: 600px) {
    .roster-grid { grid-template-columns: 1fr 1fr; }
  }

  .roster-card {
    background: #050f1e;
    border: 1px solid #0d2a4a;
    border-radius: 5px;
    padding: 12px;
    position: relative;
  }

  .roster-card-name {
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #c8d8e8;
    margin-bottom: 6px;
  }

  .mod-inventory-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  @media (min-width: 500px) {
    .mod-inventory-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (min-width: 900px) {
    .mod-inventory-grid { grid-template-columns: 1fr 1fr 1fr; }
  }

  .mod-card {
    background: #050f1e;
    border: 1px solid #0d2a4a;
    border-radius: 5px;
    padding: 10px;
    position: relative;
  }

  .mod-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .mod-shape-icon {
    font-size: 20px;
    line-height: 1;
  }

  .mod-set-label {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .mod-primary-stat {
    background: #030d1c;
    border: 1px solid #0d2a4a;
    border-radius: 3px;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 11px;
  }

  .mod-secondary-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
  }

  .mod-stat-chip {
    background: #030d1c;
    border: 1px solid #081e34;
    border-radius: 2px;
    padding: 2px 6px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    color: #5a8aaa;
    display: flex;
    justify-content: space-between;
  }

  .mod-assigned {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    color: #2a7a5a;
    margin-top: 6px;
    padding: 2px 6px;
    background: #041410;
    border: 1px solid #0a3a28;
    border-radius: 2px;
    display: inline-block;
  }

  .assign-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .assign-select {
    flex: 1;
    background: #030d1c;
    border: 1px solid #0d2a4a;
    border-radius: 3px;
    padding: 4px 8px;
    color: #c8d8e8;
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px;
    outline: none;
  }

  .scanline {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,229,255,0.01) 2px,
      rgba(0,229,255,0.01) 4px
    );
    pointer-events: none;
    z-index: 1000;
  }

  .glow-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #0d4a7a, transparent);
    margin: 12px 0;
  }

  .summary-bar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    background: #040d1a;
    border: 1px solid #0d2a4a;
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }

  .summary-stat {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #4a8aaa;
  }

  .summary-stat span {
    color: #00e5ff;
    font-size: 14px;
    font-weight: bold;
    margin-right: 4px;
  }

  .collapsed { display: none; }

  .expand-btn {
    background: none;
    border: none;
    color: #3a6a8a;
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    padding: 0;
    letter-spacing: 0.1em;
  }

  .expand-btn:hover { color: #00e5ff; }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ModSlotDisplay({ shape, primary, setColor }) {
  return (
    <div className="mod-slot">
      <div className="mod-slot-label">{shape.substring(0, 4).toUpperCase()}</div>
      <div className="mod-slot-icon" style={{ color: setColor || "#3a6a8a" }}>
        {MOD_SHAPE_ICONS[MOD_SHAPES.indexOf(shape)] || "◆"}
      </div>
      <div className="mod-slot-primary">{primary}</div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColor = PRIORITY_COLORS[rec.priority] || "#9e9e9e";
  const roleColor = ROLE_COLORS[rec.role] || "#9e9e9e";

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="char-name">{rec.name}</div>
          <div className="tags" style={{ marginBottom: 0, marginTop: 4 }}>
            {rec.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge" style={{ background: roleColor + "22", color: roleColor, border: `1px solid ${roleColor}55` }}>
            {rec.role}
          </span>
          <span className="badge" style={{ background: priorityColor + "22", color: priorityColor, border: `1px solid ${priorityColor}55` }}>
            {rec.priority}
          </span>
          <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? "▲ LESS" : "▼ MORE"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div className="form-label" style={{ marginBottom: 4 }}>RECOMMENDED SETS</div>
        <div className="set-boxes">
          {rec.sets.map((s, i) => {
            const setDef = MOD_SETS.find(m => m.name === s);
            return (
              <span key={i} className="set-box" style={{ color: setDef?.color || "#9e9e9e", borderColor: (setDef?.color || "#9e9e9e") + "55", background: (setDef?.color || "#9e9e9e") + "11" }}>
                {setDef?.icon} {s}
              </span>
            );
          })}
        </div>
      </div>

      <div className="form-label" style={{ marginBottom: 6 }}>PRIMARY STATS</div>
      <div className="mod-grid">
        {MOD_SHAPES.map(shape => {
          const primary = rec.primaries[shape];
          const setName = rec.sets[0];
          const setDef = MOD_SETS.find(m => m.name === setName);
          return <ModSlotDisplay key={shape} shape={shape} primary={primary} setColor={setDef?.color} />;
        })}
      </div>

      {expanded && (
        <>
          <div className="glow-divider" />
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>SECONDARY STAT PRIORITY</div>
            <div className="priority-list">
              {rec.secondaryPriority.map((stat, i) => (
                <div key={stat} className="priority-item">
                  <span className="priority-rank">#{i + 1}</span>
                  {stat}
                </div>
              ))}
            </div>
          </div>

          <div className="speed-target">
            ⚡ SPEED TARGET — {rec.speedTarget}+
          </div>

          <div className="notes-box">{rec.notes}</div>
        </>
      )}
    </div>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────

function RecommendationsTab() {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState(null);
  const [filterRole, setFilterRole] = useState(null);

  const filtered = useMemo(() => {
    return RECOMMENDATIONS.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      const matchPriority = !filterPriority || r.priority === filterPriority;
      const matchRole = !filterRole || r.role === filterRole;
      return matchSearch && matchPriority && matchRole;
    });
  }, [search, filterPriority, filterRole]);

  const priorities = ["META", "High", "Medium", "Low"];
  const roles = [...new Set(RECOMMENDATIONS.map(r => r.role))];

  return (
    <div>
      <div className="section-title">MOD RECOMMENDATIONS DATABASE</div>
      <div style={{ background: "#050e1c", border: "1px solid #1e4a2a", borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#4a9a6a", fontFamily: "Share Tech Mono, monospace", lineHeight: 1.6 }}>
        ⚡ F2P FOCUS (5M+ GP) · Data: top Kyber GAC players via swgoh.gg · Updated March 2026<br/>
        <span style={{ color: "#3a6a8a" }}>Covers F2P-achievable GLs (SLKR, SEE, LV, JML, Rey, JMK, GAS) + key supporting and non-GL meta teams.</span>
      </div>
      <input
        className="search-bar"
        placeholder="Search characters, tags..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="filter-row">
        <span className="form-label" style={{ alignSelf: "center" }}>PRIORITY:</span>
        {priorities.map(p => (
          <button key={p} className={`filter-btn ${filterPriority === p ? "active" : ""}`} onClick={() => setFilterPriority(filterPriority === p ? null : p)}>
            {p}
          </button>
        ))}
        <span style={{ width: 8 }} />
        <span className="form-label" style={{ alignSelf: "center" }}>ROLE:</span>
        {roles.map(r => (
          <button key={r} className={`filter-btn ${filterRole === r ? "active" : ""}`} onClick={() => setFilterRole(filterRole === r ? null : r)}>
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          NO CHARACTERS FOUND
        </div>
      ) : (
        filtered.map(rec => <RecommendationCard key={rec.name} rec={rec} />)
      )}
    </div>
  );
}

// ─── ROLE INFERENCE ───────────────────────────────────────────────────────────
// Maps combat_type and base_id hints to roles
function inferRole(name) {
  const n = (name || "").toLowerCase();
  if (["kenobi","chewbacca","wrecker","grand inquisitor","first order stormtrooper","clone sergeant","clone trooper"].some(t => n.includes(t))) return "Tank";
  if (["emperor","bb-8","hera","tech","padmé","padme","commander cody","moff"].some(t => n.includes(t))) return "Support";
  if (["barriss","hermit yoda","jedi consular"].some(t => n.includes(t))) return "Healer";
  return "Attacker";
}

// swgoh.gg API character name mappings (base_id → display name)
// Covers the most common characters; anything not matched falls back to the raw name
const BASE_ID_NAMES = {
  SUPREMELEADERKYLOREN: "Supreme Leader Kylo Ren",
  LORDVADER: "Lord Vader",
  JEDIMASTERLUKESKYWALKER: "Jedi Master Luke Skywalker",
  SITHETERNALEMPEROR: "Sith Eternal Emperor",
  REY: "Rey",
  JEDIMASTERKENOBI: "Jedi Master Kenobi",
  GENERALSKYWALKER: "General Skywalker",
  JABBATHEHUTT: "Jabba the Hutt",
  DARTHMALGUS: "Darth Malgus",
  DARTHBANE: "Darth Bane",
  COMMANDERAHSOKATANO: "Commander Ahsoka Tano",
  AHSOKATANO: "Ahsoka Tano (Snips)",
  PADMEAMIDALA: "Padmé Amidala",
  GENERALKENOBI: "General Kenobi",
  BENSOLO: "Ben Solo",
  CALKESTIS: "Cal Kestis",
  EZRABRIDGER_EXILE: "Ezra Bridger (Exile)",
  EZRABRIDGER: "Ezra Bridger",
  REVA: "Reva (Third Sister)",
  GRANDINQUISITOR: "Grand Inquisitor",
  COMMANDERLUKESKY: "Commander Luke Skywalker",
  DARTHREVAN: "Darth Revan",
  DARTHMALAK: "Darth Malak",
  BASTILASHANDARK: "Bastila Shan (Fallen)",
  HUNTER: "Hunter",
  TECH: "Tech",
  WRECKER: "Wrecker",
  CROSSHAIR: "Crosshair",
  ECHO: "Echo",
  OMEGA: "Omega",
  KYLORENUNMASKED: "Kylo Ren (Unmasked)",
  FIRSTORDERSTORMTROOPER: "First Order Stormtrooper",
  FIRSTORDERSPECIALFORCESPILOT: "First Order SF TIE Pilot",
  COMMANDERCODY: "Commander Cody",
  HERASYNDULLA: "Hera Syndulla",
  SABINEWREN: "Sabine Wren",
  COLONELSTARCK: "Colonel Starck",
  IMPERIALPROBEDROID: "Imperial Probe Droid",
  GRANDADMIRALTHRAWN: "Grand Admiral Thrawn",
  EMPERORPALPATINE: "Emperor Palpatine",
  DARTHVADER: "Darth Vader",
  HAN: "Han Solo",
  HANSOLO: "Han Solo",
  OLDREPUBLICHERO: "Jedi Knight Revan",
  STARKILLER: "Starkiller",
};

function resolveCharName(unit) {
  // Try base_id lookup first
  const fromId = BASE_ID_NAMES[(unit.data?.base_id || "").toUpperCase()];
  if (fromId) return fromId;
  // Fall back to the name field
  return unit.data?.name || unit.base_id || "Unknown";
}

// ─── IMPORT MODAL ─────────────────────────────────────────────────────────────

function ImportModal({ onClose, onImport }) {
  const [mode, setMode] = useState("allycode"); // "allycode" | "json" | "csv"
  const [allyCode, setAllyCode] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [rawCsv, setRawCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // array of parsed chars before confirm

  const fetchByAllyCode = async () => {
    const code = allyCode.replace(/-/g, "").trim();
    if (!code || code.length < 8) { setError("Enter a valid ally code (9 digits)."); return; }
    setLoading(true); setError(""); setPreview(null);

    // Try swgoh.gg public API via corsproxy.io
    const url = `https://swgoh.gg/api/player/${code}/`;
    const proxies = [
      `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    ];

    let data = null;
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const raw = await res.json();
        // allorigins wraps in {contents: "..."}
        data = raw.contents ? JSON.parse(raw.contents) : raw;
        if (data?.roster || data?.data?.roster) break;
      } catch {}
    }

    setLoading(false);
    if (!data) {
      setError("Could not reach swgoh.gg API — CORS blocked. Use JSON Paste or CSV import below instead.");
      return;
    }

    const roster = data.roster || data.data?.roster || [];
    if (!roster.length) { setError("No characters found in API response."); return; }

    const parsed = roster
      .filter(u => u.data?.combat_type === 1) // characters only, not ships
      .map(u => ({
        name: resolveCharName(u),
        gear: String(u.data?.gear_level || 1),
        relic: String(Math.max(0, (u.data?.relic_currentTier || 0) - 2)), // API uses 1-indexed, 1&2 = no relic
        role: inferRole(resolveCharName(u)),
        stars: u.data?.rarity || 1,
        gp: u.data?.gp || 0,
      }))
      .filter(u => u.name !== "Unknown")
      .sort((a, b) => b.gp - a.gp);

    setPreview(parsed);
  };

  const parseJson = () => {
    setError(""); setPreview(null);
    try {
      const data = JSON.parse(rawJson);
      // Support both full API response and array of unit objects
      const roster = Array.isArray(data) ? data : (data.roster || data.data?.roster || []);
      if (!roster.length) throw new Error("No roster array found.");
      const parsed = roster
        .filter(u => !u.data || u.data.combat_type === 1)
        .map(u => ({
          name: resolveCharName(u),
          gear: String(u.data?.gear_level || u.gear_level || 1),
          relic: String(Math.max(0, (u.data?.relic_currentTier || u.relic_currentTier || 0) - 2)),
          role: inferRole(resolveCharName(u)),
          stars: u.data?.rarity || u.rarity || 1,
          gp: u.data?.gp || u.gp || 0,
        }))
        .filter(u => u.name !== "Unknown")
        .sort((a, b) => b.gp - a.gp);
      setPreview(parsed);
    } catch (e) {
      setError("Could not parse JSON: " + e.message);
    }
  };

  const parseCsv = () => {
    setError(""); setPreview(null);
    try {
      const lines = rawCsv.trim().split("\n").filter(l => l.trim());
      const parsed = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        const name = parts[0];
        const gear = parts[1] || "13";
        const relic = parts[2] || "0";
        const role = parts[3] || inferRole(name);
        if (!name) return null;
        return { name, gear, relic, role, stars: 7, gp: 0 };
      }).filter(Boolean);
      if (!parsed.length) throw new Error("No rows parsed.");
      setPreview(parsed);
    } catch (e) {
      setError("Could not parse CSV: " + e.message);
    }
  };

  const confirmImport = () => {
    if (!preview?.length) return;
    onImport(preview.map(c => ({ ...c, id: Date.now() + Math.random() })));
    onClose();
  };

  const modeStyle = (m) => ({
    flex: 1, padding: "8px 4px", textAlign: "center",
    fontFamily: "'Orbitron', monospace", fontSize: 9, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase", border: "none",
    background: mode === m ? "#0a2a4a" : "transparent",
    color: mode === m ? "#00e5ff" : "#3a6a8a",
    cursor: "pointer", borderBottom: mode === m ? "2px solid #00e5ff" : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#050f1e", border: "1px solid #1e4a7a", borderRadius: 8,
        width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 0 40px rgba(0,100,200,0.3)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #0d2a4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#00e5ff", letterSpacing: "0.1em" }}>
            IMPORT ROSTER
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a6a8a", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* Mode selector */}
        <div style={{ display: "flex", borderBottom: "1px solid #0d2a4a" }}>
          <button style={modeStyle("allycode")} onClick={() => { setMode("allycode"); setError(""); setPreview(null); }}>
            📡 Ally Code
          </button>
          <button style={modeStyle("json")} onClick={() => { setMode("json"); setError(""); setPreview(null); }}>
            {"{ }"} JSON Paste
          </button>
          <button style={modeStyle("csv")} onClick={() => { setMode("csv"); setError(""); setPreview(null); }}>
            📋 CSV / Manual
          </button>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── ALLY CODE MODE ─────────────────────────── */}
          {mode === "allycode" && !preview && (
            <div>
              <div className="notes-box" style={{ marginBottom: 14 }}>
                Enter your 9-digit ally code (found in your in-game profile). This fetches your roster live from <strong style={{ color: "#7ab8d8" }}>swgoh.gg</strong> — your profile must be <strong style={{ color: "#7ab8d8" }}>public</strong> there. If the fetch fails due to browser restrictions, switch to JSON Paste.
              </div>
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label className="form-label">Ally Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. 123-456-789"
                  value={allyCode}
                  onChange={e => setAllyCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchByAllyCode()}
                  style={{ fontSize: 16, letterSpacing: "0.15em" }}
                />
              </div>
              <button className="btn btn-primary" onClick={fetchByAllyCode} disabled={loading}>
                {loading ? "FETCHING..." : "FETCH ROSTER →"}
              </button>
            </div>
          )}

          {/* ── JSON MODE ──────────────────────────────── */}
          {mode === "json" && !preview && (
            <div>
              <div className="notes-box" style={{ marginBottom: 14 }}>
                <strong style={{ color: "#7ab8d8" }}>How to get your JSON:</strong><br />
                1. Go to <strong style={{ color: "#00e5ff" }}>swgoh.gg/p/YOUR-ALLY-CODE/</strong><br />
                2. Open browser DevTools → Network tab<br />
                3. Reload the page and look for a request to <code style={{ color: "#00e5c0" }}>/api/player/</code><br />
                4. Copy the full response JSON and paste below.<br /><br />
                <span style={{ color: "#4a6a8a" }}>Alternatively, tools like Grandivory's Mods Optimizer export JSON you can paste here.</span>
              </div>
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label className="form-label">Paste JSON</label>
                <textarea
                  className="form-input"
                  rows={8}
                  placeholder={'{ "roster": [ { "data": { "name": "...", "gear_level": 13 } } ] }'}
                  value={rawJson}
                  onChange={e => setRawJson(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }}
                />
              </div>
              <button className="btn btn-primary" onClick={parseJson}>PARSE JSON →</button>
            </div>
          )}

          {/* ── CSV MODE ───────────────────────────────── */}
          {mode === "csv" && !preview && (
            <div>
              <div className="notes-box" style={{ marginBottom: 14 }}>
                Enter one character per line:<br />
                <code style={{ color: "#00e5c0" }}>Name, GearLevel, RelicLevel, Role</code><br /><br />
                <strong style={{ color: "#7ab8d8" }}>Examples:</strong><br />
                <code style={{ color: "#5ab8a0" }}>Lord Vader, 13, 7, Attacker</code><br />
                <code style={{ color: "#5ab8a0" }}>Sith Eternal Emperor, 13, 9, Attacker</code><br />
                <code style={{ color: "#5ab8a0" }}>General Kenobi, 13, 7, Tank</code><br /><br />
                <span style={{ color: "#4a6a8a" }}>Gear and Relic default to 13/0 if omitted. Role defaults to Attacker.</span>
              </div>
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label className="form-label">Paste Characters (CSV)</label>
                <textarea
                  className="form-input"
                  rows={10}
                  placeholder={"Lord Vader, 13, 7, Attacker\nSith Eternal Emperor, 13, 9, Attacker\nDarth Bane, 13, 7, Attacker"}
                  value={rawCsv}
                  onChange={e => setRawCsv(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "'Share Tech Mono', monospace", fontSize: 12 }}
                />
              </div>
              <button className="btn btn-primary" onClick={parseCsv}>PARSE CSV →</button>
            </div>
          )}

          {/* ── ERROR ──────────────────────────────────── */}
          {error && (
            <div style={{ background: "#1a0808", border: "1px solid #4a1010", borderRadius: 4, padding: "10px 14px", marginTop: 12, color: "#ff7070", fontFamily: "'Share Tech Mono', monospace", fontSize: 11, lineHeight: 1.6 }}>
              ⚠ {error}
            </div>
          )}

          {/* ── PREVIEW ────────────────────────────────── */}
          {preview && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "#00e5ff" }}>
                  PREVIEW — {preview.length} CHARACTERS
                </div>
                <button className="btn btn-sm" onClick={() => setPreview(null)}>← BACK</button>
              </div>

              <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 14, border: "1px solid #0d2a4a", borderRadius: 4 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#030d1c", borderBottom: "1px solid #0d2a4a" }}>
                      <th style={{ padding: "6px 10px", textAlign: "left", color: "#3a6a8a", fontWeight: "normal", letterSpacing: "0.1em" }}>CHARACTER</th>
                      <th style={{ padding: "6px 10px", textAlign: "center", color: "#3a6a8a", fontWeight: "normal" }}>GEAR</th>
                      <th style={{ padding: "6px 10px", textAlign: "center", color: "#3a6a8a", fontWeight: "normal" }}>RELIC</th>
                      <th style={{ padding: "6px 10px", textAlign: "left", color: "#3a6a8a", fontWeight: "normal" }}>ROLE</th>
                      <th style={{ padding: "6px 10px", textAlign: "center", color: "#3a6a8a", fontWeight: "normal" }}>GUIDE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((c, i) => {
                      const hasGuide = RECOMMENDATIONS.some(r => r.name.toLowerCase() === c.name.toLowerCase());
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #081e34", background: i % 2 === 0 ? "transparent" : "#030d1c" }}>
                          <td style={{ padding: "5px 10px", color: "#c8d8e8" }}>{c.name}</td>
                          <td style={{ padding: "5px 10px", textAlign: "center", color: "#5a9aaa" }}>G{c.gear}</td>
                          <td style={{ padding: "5px 10px", textAlign: "center", color: "#5a9aaa" }}>R{c.relic}</td>
                          <td style={{ padding: "5px 10px", color: ROLE_COLORS[c.role] || "#9e9e9e" }}>{c.role}</td>
                          <td style={{ padding: "5px 10px", textAlign: "center", color: hasGuide ? "#4aaa5a" : "#2a4a2a" }}>{hasGuide ? "✓" : "·"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={confirmImport}>
                  ✓ IMPORT {preview.length} CHARACTERS
                </button>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#4a6a8a" }}>
                  {preview.filter(c => RECOMMENDATIONS.some(r => r.name.toLowerCase() === c.name.toLowerCase())).length} have mod guides
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROSTER TAB ───────────────────────────────────────────────────────────────

function RosterTab({ roster, setRoster }) {
  const [form, setForm] = useState({ name: "", gear: "13", relic: "0", role: "Attacker" });
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filterGuide, setFilterGuide] = useState(false);

  const add = () => {
    if (!form.name.trim()) return;
    setRoster(r => [...r, { ...form, id: Date.now(), name: form.name.trim() }]);
    setForm({ name: "", gear: "13", relic: "0", role: "Attacker" });
    setShowForm(false);
  };

  const remove = (id) => setRoster(r => r.filter(c => c.id !== id));
  const clearAll = () => { if (window.confirm("Clear entire roster?")) setRoster([]); };

  const matchedRec = (name) => RECOMMENDATIONS.find(r => r.name.toLowerCase() === name.toLowerCase());

  const handleImport = (chars) => {
    setRoster(existing => {
      const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
      const newChars = chars.filter(c => !existingNames.has(c.name.toLowerCase()));
      return [...existing, ...newChars];
    });
  };

  const displayed = filterGuide ? roster.filter(c => matchedRec(c.name)) : roster;

  return (
    <div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}

      <div className="section-title">MY ROSTER</div>

      {roster.length > 0 && (
        <div className="summary-bar">
          <div className="summary-stat"><span>{roster.length}</span> Characters</div>
          <div className="summary-stat"><span>{roster.filter(c => parseInt(c.relic) >= 5).length}</span> Relic 5+</div>
          <div className="summary-stat"><span>{roster.filter(c => parseInt(c.relic) >= 7).length}</span> Relic 7+</div>
          <div className="summary-stat"><span>{roster.filter(c => matchedRec(c.name)).length}</span> With Mod Guide</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowImport(true)}>
          ⬇ IMPORT ROSTER
        </button>
        <button className="btn btn-sm" onClick={() => { setShowForm(s => !s); }}>
          {showForm ? "— CANCEL" : "+ ADD ONE"}
        </button>
        {roster.length > 0 && (
          <>
            <button
              className={`filter-btn ${filterGuide ? "active" : ""}`}
              onClick={() => setFilterGuide(f => !f)}
              style={{ marginLeft: "auto" }}
            >
              {filterGuide ? "★ GUIDE ONLY" : "ALL CHARS"}
            </button>
            <button className="btn btn-danger" onClick={clearAll}>CLEAR ALL</button>
          </>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ fontSize: 11 }}>ADD CHARACTER</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Character Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lord Vader" list="char-suggestions" />
              <datalist id="char-suggestions">
                {RECOMMENDATIONS.map(r => <option key={r.name} value={r.name} />)}
              </datalist>
            </div>
            <div className="form-field">
              <label className="form-label">Gear Level</label>
              <select className="form-select" value={form.gear} onChange={e => setForm(f => ({ ...f, gear: e.target.value }))}>
                {[...Array(13)].map((_, i) => <option key={i + 1} value={i + 1}>Gear {i + 1}</option>)}
                <option value="13">Gear 13</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Relic Level</label>
              <select className="form-select" value={form.relic} onChange={e => setForm(f => ({ ...f, relic: e.target.value }))}>
                {[...Array(10)].map((_, i) => <option key={i} value={i}>Relic {i}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {["Attacker", "Tank", "Support", "Healer", "Fleet Support"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={add}>ADD TO ROSTER</button>
        </div>
      )}

      {roster.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👾</div>
          NO CHARACTERS IN ROSTER<br /><br />
          Import via Ally Code, JSON, or CSV — or add manually.
        </div>
      ) : (
        <div className="roster-grid">
          {displayed.map(c => {
            const rec = matchedRec(c.name);
            const roleColor = ROLE_COLORS[c.role] || "#9e9e9e";
            const relicNum = parseInt(c.relic) || 0;
            return (
              <div key={c.id} className="roster-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="roster-card-name">{c.name}</div>
                  <button className="btn btn-danger" onClick={() => remove(c.id)}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  <span className="badge" style={{ background: roleColor + "22", color: roleColor, border: `1px solid ${roleColor}44` }}>{c.role}</span>
                  <span className="badge" style={{ background: "#0a2a4a", color: "#5a9aaa", border: "1px solid #0d2a4a" }}>
                    G{c.gear}
                  </span>
                  <span className="badge" style={{
                    background: relicNum >= 7 ? "#1a1005" : relicNum >= 5 ? "#0a1505" : "#0a1020",
                    color: relicNum >= 7 ? "#ffa726" : relicNum >= 5 ? "#66bb6a" : "#4a7aaa",
                    border: `1px solid ${relicNum >= 7 ? "#4a3010" : relicNum >= 5 ? "#1a4a1a" : "#0d2a4a"}`,
                  }}>
                    R{c.relic}
                  </span>
                  {rec && <span className="badge" style={{ background: "#0a2a0a", color: "#4aaa5a", border: "1px solid #0d3a0d" }}>✓ GUIDE</span>}
                </div>
                {rec && (
                  <div style={{ fontSize: 11, color: "#4a7a6a", fontFamily: "'Share Tech Mono', monospace" }}>
                    Target: {rec.speedTarget}+ spd · {rec.sets.join(" + ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STAT_NAMES = ["Speed", "Offense %", "Defense %", "Health %", "Protection %", "Potency %", "Tenacity %",
  "Critical Chance %", "Critical Damage %", "Offense (flat)", "Defense (flat)", "Health (flat)"];

function ModInventoryTab({ mods, setMods, roster }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    shape: "Receiver", set: "Speed", tier: "Gold (6★)",
    primary: "Speed", secondary1: "", s1val: "", secondary2: "", s2val: "",
    secondary3: "", s3val: "", secondary4: "", s4val: "", assignedTo: ""
  });
  const [filterShape, setFilterShape] = useState(null);
  const [filterSet, setFilterSet] = useState(null);

  const add = () => {
    const newMod = { ...form, id: Date.now() };
    setMods(m => [...m, newMod]);
    setShowForm(false);
  };

  const remove = (id) => setMods(m => m.filter(mod => mod.id !== id));

  const assign = (modId, charName) => {
    setMods(m => m.map(mod => mod.id === modId ? { ...mod, assignedTo: charName } : mod));
  };

  const filtered = mods.filter(m => {
    const matchShape = !filterShape || m.shape === filterShape;
    const matchSet = !filterSet || m.set === filterSet;
    return matchShape && matchSet;
  });

  const tierColor = (tier) => TIER_COLORS[TIER_LABELS.indexOf(tier)] || "#9e9e9e";

  return (
    <div>
      <div className="section-title">MOD INVENTORY</div>

      {mods.length > 0 && (
        <div className="summary-bar">
          <div className="summary-stat"><span>{mods.length}</span> Mods Total</div>
          <div className="summary-stat"><span>{mods.filter(m => m.assignedTo).length}</span> Assigned</div>
          <div className="summary-stat"><span>{mods.filter(m => m.tier === "Gold (6★)").length}</span> Gold</div>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginBottom: 12 }} onClick={() => setShowForm(s => !s)}>
        {showForm ? "— CANCEL" : "+ ADD MOD"}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ fontSize: 11 }}>ADD MOD</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Shape (Slot)</label>
              <select className="form-select" value={form.shape} onChange={e => setForm(f => ({ ...f, shape: e.target.value, primary: PRIMARIES[e.target.value][0] }))}>
                {MOD_SHAPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Set Bonus</label>
              <select className="form-select" value={form.set} onChange={e => setForm(f => ({ ...f, set: e.target.value }))}>
                {MOD_SETS.map(s => <option key={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Tier</label>
              <select className="form-select" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                {TIER_LABELS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Primary Stat</label>
              <select className="form-select" value={form.primary} onChange={e => setForm(f => ({ ...f, primary: e.target.value }))}>
                {(PRIMARIES[form.shape] || []).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Secondary 1</label>
              <select className="form-select" value={form.secondary1} onChange={e => setForm(f => ({ ...f, secondary1: e.target.value }))}>
                <option value="">—</option>
                {STAT_NAMES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Sec 1 Value</label>
              <input className="form-input" placeholder="e.g. 25" value={form.s1val} onChange={e => setForm(f => ({ ...f, s1val: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Secondary 2</label>
              <select className="form-select" value={form.secondary2} onChange={e => setForm(f => ({ ...f, secondary2: e.target.value }))}>
                <option value="">—</option>
                {STAT_NAMES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Sec 2 Value</label>
              <input className="form-input" placeholder="e.g. 3.5" value={form.s2val} onChange={e => setForm(f => ({ ...f, s2val: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Secondary 3</label>
              <select className="form-select" value={form.secondary3} onChange={e => setForm(f => ({ ...f, secondary3: e.target.value }))}>
                <option value="">—</option>
                {STAT_NAMES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Sec 3 Value</label>
              <input className="form-input" placeholder="e.g. 4.2" value={form.s3val} onChange={e => setForm(f => ({ ...f, s3val: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Secondary 4</label>
              <select className="form-select" value={form.secondary4} onChange={e => setForm(f => ({ ...f, secondary4: e.target.value }))}>
                <option value="">—</option>
                {STAT_NAMES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Sec 4 Value</label>
              <input className="form-input" placeholder="e.g. 1.8" value={form.s4val} onChange={e => setForm(f => ({ ...f, s4val: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={add}>ADD MOD</button>
        </div>
      )}

      {mods.length > 0 && (
        <div className="filter-row" style={{ marginBottom: 12 }}>
          <span className="form-label" style={{ alignSelf: "center" }}>SHAPE:</span>
          {MOD_SHAPES.map(s => (
            <button key={s} className={`filter-btn ${filterShape === s ? "active" : ""}`} onClick={() => setFilterShape(filterShape === s ? null : s)}>
              {MOD_SHAPE_ICONS[MOD_SHAPES.indexOf(s)]} {s.substring(0, 5)}
            </button>
          ))}
        </div>
      )}

      {mods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          NO MODS IN INVENTORY<br /><br />Add mods to track and assign them to characters.
        </div>
      ) : (
        <div className="mod-inventory-grid">
          {filtered.map(mod => {
            const setDef = MOD_SETS.find(m => m.name === mod.set);
            const tc = tierColor(mod.tier);
            const secondaries = [
              mod.secondary1 && { name: mod.secondary1, val: mod.s1val },
              mod.secondary2 && { name: mod.secondary2, val: mod.s2val },
              mod.secondary3 && { name: mod.secondary3, val: mod.s3val },
              mod.secondary4 && { name: mod.secondary4, val: mod.s4val },
            ].filter(Boolean);

            return (
              <div key={mod.id} className="mod-card" style={{ borderColor: tc + "44" }}>
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <button className="btn btn-danger" onClick={() => remove(mod.id)}>✕</button>
                </div>
                <div className="mod-card-header">
                  <span className="mod-shape-icon" style={{ color: setDef?.color || "#9e9e9e" }}>
                    {MOD_SHAPE_ICONS[MOD_SHAPES.indexOf(mod.shape)]}
                  </span>
                  <div>
                    <div className="mod-set-label" style={{ color: setDef?.color || "#9e9e9e" }}>
                      {setDef?.icon} {mod.set}
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#3a6a8a" }}>
                      {mod.shape.toUpperCase()}
                    </div>
                  </div>
                  <span className="badge" style={{ color: tc, borderColor: tc + "44", background: tc + "11", marginLeft: "auto", marginRight: 20 }}>
                    {mod.tier.split(" ")[0]}
                  </span>
                </div>

                <div className="mod-primary-stat">
                  <span style={{ color: "#4a8aaa", fontSize: 9, fontFamily: "'Share Tech Mono', monospace" }}>PRIMARY</span>
                  <span style={{ color: "#00e5ff", fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }}>{mod.primary}</span>
                </div>

                {secondaries.length > 0 && (
                  <div className="mod-secondary-stats">
                    {secondaries.map((s, i) => (
                      <div key={i} className="mod-stat-chip">
                        <span>{s.name.replace(" %", "%").substring(0, 10)}</span>
                        {s.val && <span style={{ color: "#00e5c0" }}>+{s.val}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="assign-row">
                  <select className="assign-select" value={mod.assignedTo || ""} onChange={e => assign(mod.id, e.target.value)}>
                    <option value="">— Unassigned —</option>
                    {roster.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {mod.assignedTo && <div className="mod-assigned">⟶ {mod.assignedTo}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AssignmentsTab({ roster, mods }) {
  const getCharMods = (charName) => mods.filter(m => m.assignedTo === charName);
  const rec = (name) => RECOMMENDATIONS.find(r => r.name.toLowerCase() === name.toLowerCase());

  if (roster.length === 0) {
    return (
      <div>
        <div className="section-title">MOD ASSIGNMENTS</div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          ADD CHARACTERS TO YOUR ROSTER<br /><br />Then assign mods from the Inventory tab.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">MOD ASSIGNMENTS</div>
      {roster.map(c => {
        const charMods = getCharMods(c.name);
        const charRec = rec(c.name);
        const hasAllSlots = MOD_SHAPES.every(shape => charMods.some(m => m.shape === shape));
        const totalSpeed = charMods.filter(m => m.secondary1 === "Speed").reduce((a, m) => a + (parseInt(m.s1val) || 0), 0)
          + charMods.filter(m => m.secondary2 === "Speed").reduce((a, m) => a + (parseInt(m.s2val) || 0), 0)
          + charMods.filter(m => m.secondary3 === "Speed").reduce((a, m) => a + (parseInt(m.s3val) || 0), 0)
          + charMods.filter(m => m.secondary4 === "Speed").reduce((a, m) => a + (parseInt(m.s4val) || 0), 0)
          + charMods.filter(m => m.primary === "Speed").length * 30;

        return (
          <div key={c.id} className="card">
            <div className="card-header">
              <div className="char-name">{c.name}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="badge" style={{ background: "#0a2a0a", color: hasAllSlots ? "#4aaa5a" : "#aa7a3a", border: `1px solid ${hasAllSlots ? "#0d3a0d" : "#3a2a0d"}` }}>
                  {charMods.length}/6 SLOTS
                </span>
                {totalSpeed > 0 && (
                  <span className="badge" style={{ background: "#051525", color: "#00e5c0", border: "1px solid #0d4a3a" }}>
                    ⚡ +{totalSpeed} SPD
                  </span>
                )}
              </div>
            </div>

            {charRec && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#4a7a6a" }}>
                  GUIDE: {charRec.sets.join(" + ")} sets · Target: {charRec.speedTarget}+ speed
                </div>
              </div>
            )}

            {charMods.length === 0 ? (
              <div style={{ color: "#2a4a6a", fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }}>
                No mods assigned — go to Inventory to assign mods
              </div>
            ) : (
              <div className="mod-grid">
                {MOD_SHAPES.map(shape => {
                  const mod = charMods.find(m => m.shape === shape);
                  const setDef = mod ? MOD_SETS.find(m => m.name === mod.set) : null;
                  if (!mod) {
                    return (
                      <div key={shape} className="mod-slot" style={{ opacity: 0.3 }}>
                        <div className="mod-slot-label">{shape.substring(0, 4).toUpperCase()}</div>
                        <div className="mod-slot-icon">—</div>
                        <div className="mod-slot-primary">EMPTY</div>
                      </div>
                    );
                  }
                  return (
                    <div key={shape} className="mod-slot" style={{ borderColor: (setDef?.color || "#9e9e9e") + "44" }}>
                      <div className="mod-slot-label">{shape.substring(0, 4).toUpperCase()}</div>
                      <div className="mod-slot-icon" style={{ color: setDef?.color }}>{MOD_SHAPE_ICONS[MOD_SHAPES.indexOf(shape)]}</div>
                      <div className="mod-slot-primary" style={{ color: setDef?.color }}>{mod.primary}</div>
                      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#3a5a7a", marginTop: 2 }}>{mod.set}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {charRec && charMods.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div className="form-label" style={{ marginBottom: 4 }}>SLOT CHECK</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {MOD_SHAPES.map(shape => {
                    const mod = charMods.find(m => m.shape === shape);
                    const idealPrimary = charRec.primaries[shape];
                    const isCorrect = mod && mod.primary === idealPrimary;
                    const isMissing = !mod;
                    return (
                      <span key={shape} className="badge" style={{
                        background: isMissing ? "#1a0808" : isCorrect ? "#0a1a0a" : "#1a1008",
                        color: isMissing ? "#aa4a3a" : isCorrect ? "#4aaa5a" : "#aaaa3a",
                        border: `1px solid ${isMissing ? "#4a1010" : isCorrect ? "#1a4a1a" : "#4a4a10"}44`,
                        fontSize: 9
                      }}>
                        {isMissing ? "✗" : isCorrect ? "✓" : "⚠"} {shape.substring(0, 4)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState(0);
  const [roster, setRoster] = useState([]);
  const [mods, setMods] = useState([]);

  const tabs = ["Recommendations", "My Roster", "Mod Inventory", "Assignments"];

  return (
    <>
      <style>{styles}</style>
      <div className="scanline" />
      <div className="app">
        <div className="header">
          <div className="header-title">SWGOH Mod Manager</div>
          <div className="header-sub">GALAXY OF HEROES · F2P 5M+ GP · UPDATED MARCH 2026</div>
        </div>

        <div className="tabs">
          {tabs.map((t, i) => (
            <button key={t} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && <RecommendationsTab />}
        {tab === 1 && <RosterTab roster={roster} setRoster={setRoster} />}
        {tab === 2 && <ModInventoryTab mods={mods} setMods={setMods} roster={roster} />}
        {tab === 3 && <AssignmentsTab roster={roster} mods={mods} />}
      </div>
    </>
  );
}
