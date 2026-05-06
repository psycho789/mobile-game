export const LANE_X = [-2.35, 0, 2.35];

export const WEAPONS = [
  { id: "carbine", name: "Carbine", cost: 1, damage: 4.2, cooldown: 0.085, color: 0x9cf7ff, projectile: "playerBullet" },
  { id: "rifle", name: "Pulse Rifle", cost: 1, damage: 7.4, cooldown: 0.078, color: 0x75ff9b, projectile: "playerBullet" },
  { id: "cannon", name: "Cannon", cost: 2, damage: 22, cooldown: 0.115, color: 0xffd45a, projectile: "enemyBullet" },
  { id: "laser", name: "Laser", cost: 4, damage: 54, cooldown: 0.155, color: 0x9cf7ff, projectile: "flash" },
  { id: "overdrive", name: "Overdrive", cost: 5, damage: 82, cooldown: 0.13, color: 0xfff06a, projectile: "flash" },
];

export const ENEMY_TYPES = {
  grunt: { label: "Grunt", sprite: "grunt", hp: 1, shotCost: 1, shootEvery: 0.86, scale: 1, width: 1.05, reward: 2, engagementRange: 40, fireRange: 46 },
  shield: { label: "Shield", sprite: "shield", hp: 1.35, shotCost: 2, shootEvery: 0.95, scale: 1.12, width: 1.12, reward: 3, engagementRange: 34, fireRange: 42 },
  heavy: { label: "Heavy", sprite: "heavy", hp: 1.8, shotCost: 3, shootEvery: 0.62, scale: 1.28, width: 1.45, reward: 5, engagementRange: 32, fireRange: 44 },
  drone: { label: "Drone", sprite: "grunt", hp: 0.72, shotCost: 1, shootEvery: 0.68, scale: 0.78, width: 0.9, reward: 2, engagementRange: 46, fireRange: 50 },
  turret: { label: "Turret", sprite: "shield", hp: 1.15, shotCost: 2, shootEvery: 0.58, scale: 0.92, width: 1.1, reward: 3, engagementRange: 50, fireRange: 54 },
};

export const BOSS_TYPES = [
  { id: "cannonKing", name: "Cannon King", sprite: "boss", hp: 1, tint: 0xffffff, projectileColor: 0xff4bd8 },
  { id: "hoverMech", name: "Hover Mech", sprite: "heavy", hp: 0.82, tint: 0x8fe8ff, projectileColor: 0x65e8ff },
  { id: "shieldKnight", name: "Shield Knight", sprite: "shield", hp: 1.12, tint: 0xffd45a, projectileColor: 0xffa33d },
  { id: "cyberBeast", name: "Cyber Beast", sprite: "boss", hp: 1.22, tint: 0xff86ff, projectileColor: 0xb66cff },
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
  if (op.type === "multiply") return count * op.value;
  if (op.type === "divide") return Math.max(0, Math.floor(count / op.value));
  return count;
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
  const startAmmo = 220 + level * 42;
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

  for (let i = 0; i < sections; i += 1) {
    const z = startZ - i * spacing;
    const isMathSection = i === 0 || (i > 2 && (i + level) % 4 === 0) || (i > 10 && (i + level) % 7 === 0);
    const isVaultSection = !isMathSection && (i === 1 || i % 4 === 2 || (i > 9 && i % 5 === 0));
    const gates = isMathSection ? (() => {
      const addValue = 42 + hard * 9 + i * 9;
      const subtractValue = 16 + hard * 4 + i * 4;
      const multValue = i > 7 || hard > 4 ? 3 : 2;
      const pool = [
        [{ type: "add", value: addValue }, { type: "multiply", value: multValue }],
        [{ type: "subtract", value: subtractValue }, { type: "add", value: addValue + 22 }],
        [{ type: "multiply", value: 2 }, { type: "divide", value: 2 }],
        [{ type: "add", value: addValue + 34 }, { type: "subtract", value: subtractValue + 18 }],
      ];
      const pair = pool[(i + level) % pool.length];
      const swap = random() > 0.5;
      const gatePair = { left: swap ? pair[0] : pair[1], right: swap ? pair[1] : pair[0] };
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
        const hp = Math.round(20 + hard * 5.6 + i * 2.9 + g * (7 + hard * 0.75));
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
  const bossHp = Math.round((170 + level * 95) * bossType.hp);
  return { theme, bossType, sections: sectionsOut, weaponPickups, rewardPickups, coins, obstacles, expectedAmmo, startAmmo, bossHp };
}
