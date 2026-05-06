export const LANE_X = [-2.35, 0, 2.35];

export const WEAPONS = [
  { id: "carbine", name: "Carbine", cost: 1, damage: 4.2, cooldown: 0.085, color: 0x9cf7ff, projectile: "playerBullet" },
  { id: "rifle", name: "Pulse Rifle", cost: 2, damage: 9.8, cooldown: 0.074, color: 0x75ff9b, projectile: "playerBullet" },
  { id: "cannon", name: "Cannon", cost: 6, damage: 34, cooldown: 0.118, color: 0xffd45a, projectile: "enemyBullet" },
  { id: "laser", name: "Laser", cost: 11, damage: 82, cooldown: 0.17, color: 0x9cf7ff, projectile: "flash" },
  { id: "overdrive", name: "Overdrive", cost: 18, damage: 138, cooldown: 0.145, color: 0xfff06a, projectile: "flash" },
];

export const ENEMY_TYPES = {
  grunt: { label: "Grunt", sprite: "grunt", hp: 1, shotCost: 1, shootEvery: 0.86, scale: 1, width: 1.05, reward: 2, engagementRange: 40, fireRange: 46 },
  shield: { label: "Shield", sprite: "shield", hp: 1.35, shotCost: 2, shootEvery: 0.95, scale: 1.12, width: 1.12, reward: 3, engagementRange: 34, fireRange: 42 },
  heavy: { label: "Heavy", sprite: "heavy", hp: 1.8, shotCost: 3, shootEvery: 0.62, scale: 1.28, width: 1.45, reward: 5, engagementRange: 32, fireRange: 44 },
  drone: { label: "Drone", sprite: "grunt", hp: 0.72, shotCost: 1, shootEvery: 0.68, scale: 0.78, width: 0.9, reward: 2, engagementRange: 46, fireRange: 50 },
  turret: { label: "Turret", sprite: "shield", hp: 1.15, shotCost: 2, shootEvery: 0.58, scale: 0.92, width: 1.1, reward: 3, engagementRange: 50, fireRange: 54 },
};

export const BOSS_TYPES = [
  {
    id: "cannonKing",
    name: "Cannon King",
    sprite: "boss",
    attackSprite: "heavy",
    hp: 1,
    tint: 0xffffff,
    attackTint: 0xffa34a,
    projectileColor: 0xff4bd8,
    attackRate: 0.58,
    enrageRate: 0.43,
    burstCount: 2,
    damage: 8,
    projectileSpeed: 35,
    patterns: ["turret", "fan", "barrage"],
    shieldHp: 0,
    enrageAt: 0.42,
  },
  {
    id: "hoverMech",
    name: "Hover Mech",
    sprite: "heavy",
    attackSprite: "boss",
    hp: 0.92,
    tint: 0x8fe8ff,
    attackTint: 0x65e8ff,
    projectileColor: 0x65e8ff,
    attackRate: 0.5,
    enrageRate: 0.38,
    burstCount: 2,
    damage: 7,
    projectileSpeed: 42,
    patterns: ["sweep", "spread", "turret"],
    shieldHp: 0.16,
    enrageAt: 0.45,
  },
  {
    id: "shieldKnight",
    name: "Shield Knight",
    sprite: "shield",
    attackSprite: "boss",
    hp: 1.18,
    tint: 0xffd45a,
    attackTint: 0xfff1a8,
    projectileColor: 0xffa33d,
    attackRate: 0.66,
    enrageRate: 0.48,
    burstCount: 2,
    damage: 9,
    projectileSpeed: 33,
    patterns: ["wall", "fan", "shieldBurst"],
    shieldHp: 0.34,
    shieldRegen: 4,
    enrageAt: 0.5,
  },
  {
    id: "cyberBeast",
    name: "Cyber Beast",
    sprite: "boss",
    attackSprite: "grunt",
    hp: 1.28,
    tint: 0xff86ff,
    attackTint: 0xb66cff,
    projectileColor: 0xb66cff,
    attackRate: 0.46,
    enrageRate: 0.34,
    burstCount: 3,
    damage: 6,
    projectileSpeed: 46,
    patterns: ["barrage", "sweep", "fan"],
    shieldHp: 0.1,
    enrageAt: 0.38,
  },
];

export const THEMES = [
  {
    id: "neon",
    name: "Neon Highway",
    sky: 0x071a36,
    fog: 0x071a36,
    track: 0x18233e,
    ground: 0x061226,
    rail: 0x28d7ff,
    lane: 0x7ff7ff,
    gate: 0x1ea7ff,
    propA: 0xff3df2,
    propB: 0x2dff9f,
  },
  {
    id: "station",
    name: "Orbital Bridge",
    sky: 0x111728,
    fog: 0x111728,
    track: 0x31394a,
    ground: 0x171e2a,
    rail: 0xc6d8ff,
    lane: 0x9cf7ff,
    gate: 0x3a8fff,
    propA: 0xffffff,
    propB: 0x6aa8ff,
  },
  {
    id: "lava",
    name: "Lava Factory",
    sky: 0x331011,
    fog: 0x331011,
    track: 0x3b3330,
    ground: 0x1c0d0b,
    rail: 0xff8a2a,
    lane: 0xffd45a,
    gate: 0x2089ff,
    propA: 0xff4a1f,
    propB: 0xffd45a,
  },
  {
    id: "ice",
    name: "Ice Lab",
    sky: 0xb9f2ff,
    fog: 0xb9f2ff,
    track: 0x486577,
    ground: 0xd8fbff,
    rail: 0x1a86ff,
    lane: 0xffffff,
    gate: 0x2089ff,
    propA: 0x66e8ff,
    propB: 0xffffff,
  },
  {
    id: "alien",
    name: "Alien City",
    sky: 0x24113f,
    fog: 0x24113f,
    track: 0x2c315d,
    ground: 0x141b33,
    rail: 0xa7ff4f,
    lane: 0xff7bff,
    gate: 0x2089ff,
    propA: 0xa7ff4f,
    propB: 0xff7bff,
  },
];

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function applyOperation(count, op) {
  if (op.type === "add") return count + op.value;
  if (op.type === "subtract") return Math.max(0, count - op.value);
  if (op.type === "multiply") return Math.floor(count * op.value);
  if (op.type === "divide") return Math.max(0, Math.floor(count / op.value));
  return count;
}

function pickWeighted(random, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value ?? entry;
  }
  return entries[entries.length - 1].value ?? entries[entries.length - 1];
}

function makeMathGatePair({ random, level, sectionIndex, hard, recentTemplates }) {
  const base = 44 + hard * 7 + sectionIndex * 6;
  const variance = Math.floor(random() * (28 + hard * 3));
  const templates = [
    {
      id: "closeAdds",
      weight: 34,
      make: () => [
        { type: "add", value: base + variance },
        { type: "add", value: base + 12 + Math.floor(random() * 20) },
      ],
    },
    {
      id: "addVsMildMult",
      weight: 27,
      make: () => [
        { type: "add", value: base + 18 + variance },
        { type: "multiply", value: [1.15, 1.2, 1.25, 1.35][Math.floor(random() * 4)] },
      ],
    },
    {
      id: "smallRisk",
      weight: 16,
      make: () => [
        { type: "subtract", value: 10 + hard * 2 + Math.floor(random() * 20) },
        { type: "add", value: base + 35 + variance },
      ],
    },
    {
      id: "tempoChoice",
      weight: 11,
      make: () => [
        { type: "multiply", value: [1.35, 1.45, 1.5][Math.floor(random() * 3)] },
        { type: "add", value: base + 46 + variance },
      ],
    },
    {
      id: "divideTrap",
      weight: 7,
      make: () => [
        { type: "divide", value: 2 },
        { type: "add", value: base + 58 + hard * 6 + variance },
      ],
    },
    {
      id: "rareJackpot",
      weight: level > 2 && sectionIndex > 8 ? 4 : 1,
      make: () => [
        { type: "multiply", value: level > 7 && random() > 0.82 ? 2.5 : 2 },
        { type: "subtract", value: 35 + hard * 5 + Math.floor(random() * 42) },
      ],
    },
  ].map((template) => ({
    ...template,
    weight: recentTemplates.includes(template.id) ? Math.max(1, Math.floor(template.weight * 0.2)) : template.weight,
  }));

  const template = pickWeighted(random, templates);
  recentTemplates.push(template.id);
  if (recentTemplates.length > 3) recentTemplates.shift();
  const pair = template.make();
  const swap = random() > 0.5;
  return { left: swap ? pair[0] : pair[1], right: swap ? pair[1] : pair[0], template: template.id };
}

export function simulateBestPath(startAmmo, gatePairs) {
  return gatePairs.reduce((ammo, pair) => Math.max(applyOperation(ammo, pair.left), applyOperation(ammo, pair.right)), startAmmo);
}

export function generateLevel(level, { finishZ = -292 } = {}) {
  const random = rng(level * 928371 + 44);
  const theme = THEMES[(level - 1) % THEMES.length];
  const bossType = BOSS_TYPES[(level - 1) % BOSS_TYPES.length];
  const hard = level - 1;
  const sections = Math.min(26, 18 + Math.floor(hard / 2));
  const startAmmo = 430 + level * 70;
  const startZ = -24;
  const spacing = (Math.abs(finishZ) - 72) / sections;
  const gatePairs = [];
  const sectionsOut = [];
  const weaponPickups = [];
  const rewardPickups = [];
  const coins = [];
  const obstacles = [];
  const vaultWeaponProgression = level < 3 ? [1, 2, 2, 3] : level < 6 ? [1, 2, 3, 3, 4] : [1, 2, 3, 4, 4, 4];
  let vaultIndex = 0;
  const recentTemplates = [];

  for (let i = 0; i < sections; i += 1) {
    const z = startZ - i * spacing;
    const isMathSection = i === 0 || (i > 2 && (i + level) % 4 === 0) || (i > 10 && (i + level) % 7 === 0);
    const isVaultSection = !isMathSection && (i === 1 || i % 4 === 2 || (i > 9 && i % 5 === 0));
    const gates = isMathSection ? (() => {
      const gatePair = makeMathGatePair({ random, level, sectionIndex: i, hard, recentTemplates });
      gatePairs.push(gatePair);
      return gatePair;
    })() : null;

    sectionsOut.push({
      z,
      type: isMathSection ? "mathChoice" : isVaultSection ? "weaponVault" : i % 3 === 0 ? "mixedFork" : "enemyPressure",
      gates,
      enemies: [],
      decrementGates: [],
    });

    const enemyZ = z - spacing * 0.64;
    const typePool = level < 3 ? ["grunt", "grunt", "shield"] : level < 6 ? ["grunt", "shield", "heavy", "drone"] : ["grunt", "shield", "heavy", "drone", "turret"];
    const count = isVaultSection
      ? Number(i > 6)
      : 1 + Number(i > 4 && !isMathSection) + Number(i > 12 && hard > 2 && i % 3 === 0);
    for (let e = 0; e < count; e += 1) {
      const type = typePool[Math.floor(random() * typePool.length)];
      const lane = LANE_X[(e + i + level + Math.floor(random() * 2)) % LANE_X.length];
      const baseHp = 8 + hard * 4.2 + i * (2.3 + hard * 0.32);
      sectionsOut[sectionsOut.length - 1].enemies.push({
        x: lane,
        z: enemyZ - e * 2.45,
        type,
        hp: Math.round(baseHp * ENEMY_TYPES[type].hp),
      });
    }

    if (isVaultSection) {
      const rewardLane = random() > 0.5 ? LANE_X[0] : LANE_X[2];
      const enemyLane = rewardLane < 0 ? LANE_X[2] : LANE_X[0];
      const gateCount = 2 + Number(i > 6) + Number(i > 13 && level > 3);
      const rewardWeapon = vaultWeaponProgression[Math.min(vaultIndex, vaultWeaponProgression.length - 1)];
      vaultIndex += 1;
      for (let g = 0; g < gateCount; g += 1) {
        const hp = Math.round(14 + hard * 4.4 + i * 2.1 + g * (5 + hard * 0.55));
        sectionsOut[sectionsOut.length - 1].decrementGates.push({
          x: rewardLane,
          z: z - spacing * (0.22 + g * 0.14),
          hp,
          rewardId: `s${i}`,
          index: g,
          total: gateCount,
        });
      }
      rewardPickups.push({
        id: `s${i}`,
        x: rewardLane,
        z: z - spacing * (0.22 + gateCount * 0.14 + 0.08),
        type: "weapon",
        amount: 0,
        weaponIndex: rewardWeapon,
      });
      if (i > 3) {
        const type = typePool[(i + level) % typePool.length];
        sectionsOut[sectionsOut.length - 1].enemies.push({
          x: enemyLane,
          z: z - spacing * 0.3,
          type,
          hp: Math.round((14 + hard * 5 + i * 2.8) * ENEMY_TYPES[type].hp),
        });
      }
    }

    if (i % 7 === 4) obstacles.push({ x: (random() > 0.5 ? -1 : 1) * 2.65, z: z - spacing * 0.68, width: 1.15 });
  }

  for (let i = 0; i < 90 + Math.min(28, level * 3); i += 1) {
    const lane = i % 3 - 1;
    coins.push({ x: lane * 1.15, z: -18 - i * 8.2 });
  }

  const expectedAmmo = simulateBestPath(startAmmo, gatePairs);
  const bossHp = Math.round((124 + level * 58) * bossType.hp);
  return { theme, bossType, sections: sectionsOut, weaponPickups, rewardPickups, coins, obstacles, expectedAmmo, startAmmo, bossHp };
}
