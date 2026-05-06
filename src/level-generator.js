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
    combatRow: 3,
    combatCol: 0,
    visualScale: { width: 4.7, height: 4.15, y: 2.0 },
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
    combatRow: 3,
    combatCol: 4,
    visualScale: { width: 4.55, height: 3.8, y: 1.88 },
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
    combatRow: 4,
    combatCol: 0,
    visualScale: { width: 4.45, height: 4.25, y: 2.05 },
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
    combatRow: 4,
    combatCol: 4,
    visualScale: { width: 4.85, height: 3.55, y: 1.72 },
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

const PLAYER_BASE_SPEED = 12.8;
const PLAYER_MAX_SPEED_MULTIPLIER = 1.16;
const DECREMENT_GATE_BALANCE_RANGE = 70;
const DECREMENT_GATE_BALANCE_GRACE = 3.5;
const VAULT_REACTION_ENEMY_RESERVE = 0.75;
const VAULT_PROJECTILE_TRAVEL_RESERVE = 0.35;

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

function makeRunSeed() {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

function mixSeed(level, runSeed, attempt = 0) {
  return ((runSeed >>> 0) ^ Math.imul(level, 928371) ^ Math.imul(attempt + 1, 2654435761) ^ 44) >>> 0;
}

function applyOperation(count, op) {
  if (op.type === "add") return Math.min(9999, count + op.value);
  if (op.type === "subtract") return Math.max(0, count - op.value);
  if (op.type === "multiply") return Math.min(9999, Math.floor(count * op.value));
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
  const mildMultiplierWeight = level < 3 ? 2 : 3 + Math.min(5, Math.floor(level / 3));
  const tempoMultiplierWeight = level < 6 ? 1 : 2 + Math.min(4, Math.floor(level / 4));
  const divideWeight = level < 3 ? 1 : 2 + Math.min(4, Math.floor(level / 4));
  const jackpotWeight = level < 9 ? 1 : 2 + Math.min(2, Math.floor((level - 8) / 5));
  const templates = [
    {
      id: "closeAdds",
      weight: 38,
      make: () => [
        { type: "add", value: base + variance },
        { type: "add", value: base + 12 + Math.floor(random() * 20) },
      ],
    },
    {
      id: "addVsDouble",
      weight: mildMultiplierWeight,
      make: () => [
        { type: "add", value: base + 18 + variance },
        { type: "multiply", value: 2 },
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
      weight: tempoMultiplierWeight,
      make: () => [
        { type: "multiply", value: 2 },
        { type: "add", value: base + 46 + variance },
      ],
    },
    {
      id: "divideTrap",
      weight: divideWeight,
      make: () => [
        { type: "divide", value: 2 },
        { type: "add", value: base + 58 + hard * 6 + variance },
      ],
    },
    {
      id: "rareJackpot",
      weight: sectionIndex > 8 ? jackpotWeight : 1,
      make: () => [
        { type: "multiply", value: level > 12 && random() > 0.92 ? 3 : 2 },
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

function ammoCostForHp(hp, weaponIndex) {
  const weapon = WEAPONS[Math.max(0, Math.min(weaponIndex, WEAPONS.length - 1))] ?? WEAPONS[0];
  return Math.ceil(hp / weapon.damage) * weapon.cost;
}

function maxHealthForLevel(level) {
  return 100 + Math.min(40, Math.floor((level - 1) * 4));
}

function scaleVaultGateHp(baseHp, reward, { hard, gateIndex, sectionIndex, currentWeaponIndex }) {
  const currentWeapon = WEAPONS[Math.max(0, Math.min(currentWeaponIndex, WEAPONS.length - 1))] ?? WEAPONS[0];
  const isHealthReward = reward.type === "health";
  const rewardWeaponIndex = reward.weaponIndex ?? currentWeaponIndex;
  const tierGap = Math.max(0, rewardWeaponIndex - currentWeaponIndex);
  const sectionShots = Math.min(isHealthReward ? 1.2 : 2.4, sectionIndex * (isHealthReward ? 0.08 : 0.1));
  const levelShots = Math.min(isHealthReward ? 0.9 : 1.8, hard * (isHealthReward ? 0.06 : 0.08));
  const targetShots = isHealthReward
    ? 2.4 + gateIndex * 0.65 + sectionShots + levelShots
    : 3.6 + rewardWeaponIndex * 0.9 + tierGap * 0.75 + gateIndex * 0.85 + sectionShots + levelShots;
  return Math.round(currentWeapon.damage * targetShots);
}

function practicalVaultDamageLimit(gates, weaponIndex) {
  if (!gates.length) return 0;
  const weapon = WEAPONS[Math.max(0, Math.min(weaponIndex, WEAPONS.length - 1))] ?? WEAPONS[0];
  const maxSpeed = PLAYER_BASE_SPEED * PLAYER_MAX_SPEED_MULTIPLIER;
  const span = Math.abs(gates[gates.length - 1].z - gates[0].z);
  const availableTime = (DECREMENT_GATE_TARGET_RANGE + span + DECREMENT_GATE_TIME_BUFFER) / maxSpeed;
  return Math.floor((weapon.damage / weapon.cooldown) * availableTime * VAULT_DAMAGE_SAFETY);
}

function balanceVaultGateHp(gates, reward, currentWeaponIndex) {
  if (!gates.length) return;
  const limit = practicalVaultDamageLimit(gates, currentWeaponIndex);
  const currentTotal = gates.reduce((sum, gate) => sum + gate.hp, 0);
  const targetRatio = reward.type === "health" ? HEALTH_VAULT_TARGET_RATIO : WEAPON_VAULT_TARGET_RATIO;
  const targetLimit = Math.max(1, Math.floor(limit * targetRatio));
  if (currentTotal <= targetLimit) return;

  const weapon = WEAPONS[Math.max(0, Math.min(currentWeaponIndex, WEAPONS.length - 1))] ?? WEAPONS[0];
  const targetTotal = targetLimit;
  const weightTotal = gates.reduce((sum, gate) => sum + gate.hp, 0);

  gates.forEach((gate) => {
    const weightedHp = Math.max(1, Math.round((targetTotal * gate.hp) / weightTotal));
    gate.hp = weightedHp;
  });

  let balancedTotal = gates.reduce((sum, gate) => sum + gate.hp, 0);
  for (let i = gates.length - 1; balancedTotal > targetTotal && i >= 0; i = (i - 1 + gates.length) % gates.length) {
    if (gateCanTrim(gates[i], weapon)) {
      gates[i].hp -= 1;
      balancedTotal -= 1;
    }
    if (!gates.some((gate) => gateCanTrim(gate, weapon))) break;
  }
}

function gateCanTrim(gate, weapon) {
  return gate.hp > Math.max(1, Math.round(weapon.damage * 0.8));
}

function ammoCostForBoss(bossType, bossHp, weaponIndex) {
  const weapon = WEAPONS[Math.max(0, Math.min(weaponIndex, WEAPONS.length - 1))] ?? WEAPONS[0];
  let ammoCost = 0;
  let hp = bossHp;
  let shieldHp = Math.round(bossHp * (bossType.shieldHp ?? 0));
  let guard = 0;

  while ((hp > 0 || shieldHp > 0) && guard < 5000) {
    guard += 1;
    ammoCost += weapon.cost;
    let remainingDamage = weapon.damage;
    if (shieldHp > 0) {
      const shieldMultiplier = weapon.id === "carbine" ? 0.62 : weapon.id === "rifle" ? 0.82 : 1.18;
      const shieldDamage = Math.min(shieldHp, remainingDamage * shieldMultiplier);
      shieldHp = Math.max(0, shieldHp - shieldDamage);
      remainingDamage = Math.max(0, remainingDamage - shieldDamage * 0.45);
    }
    hp = Math.max(0, hp - remainingDamage);
  }

  const regenBuffer = bossType.shieldRegen ? Math.ceil(ammoCost * 0.18) : 0;
  return ammoCost + regenBuffer;
}

export function analyzeLevelSolvability(levelData) {
  let ammo = levelData.startAmmo;
  let weaponIndex = 0;
  let ammoSpent = 0;
  let highestWeapon = 0;
  const sectionReports = [];
  const vaultReports = [];

  levelData.sections.forEach((section) => {
    if (section.gates) {
      ammo = Math.max(applyOperation(ammo, section.gates.left), applyOperation(ammo, section.gates.right));
    }

    const enemyCost = section.enemies.reduce((sum, enemy) => sum + ammoCostForHp(enemy.hp, weaponIndex), 0);
    ammo -= enemyCost;
    ammoSpent += enemyCost;

    const reward = levelData.rewardPickups.find((pickup) => pickup.id === section.decrementGates?.[0]?.rewardId);
    let vaultCost = 0;
    if (reward && section.decrementGates.length) {
      const vaultHp = section.decrementGates.reduce((sum, gate) => sum + gate.hp, 0);
      const practicalLimit = practicalVaultDamageLimit(section.decrementGates, weaponIndex);
      vaultReports.push({
        section: section.type,
        rewardType: reward.type,
        rewardWeaponIndex: reward.weaponIndex,
        weaponIndex,
        vaultHp,
        practicalLimit,
        breakable: vaultHp <= practicalLimit,
      });
    }
    if (reward?.type === "weapon" && reward.weaponIndex > weaponIndex) {
      vaultCost = section.decrementGates.reduce((sum, gate) => sum + ammoCostForHp(gate.hp, weaponIndex), 0);
      if (ammo - vaultCost > WEAPONS[reward.weaponIndex].cost) {
        ammo -= vaultCost;
        ammoSpent += vaultCost;
        weaponIndex = Math.max(weaponIndex, reward.weaponIndex);
        highestWeapon = Math.max(highestWeapon, weaponIndex);
      }
    }

    sectionReports.push({ section: section.type, ammo, weaponIndex, enemyCost, vaultCost });
  });

  const bossCost = ammoCostForBoss(levelData.bossType, levelData.bossHp, weaponIndex);
  const finalAmmo = ammo - bossCost;
  const minimumUsableAmmo = WEAPONS[weaponIndex]?.cost ?? 1;
  const practicalVaultsSolvable = vaultReports.every((report) => report.breakable);
  return {
    solvable: finalAmmo >= minimumUsableAmmo && practicalVaultsSolvable,
    finalAmmo,
    bossCost,
    weaponIndex,
    highestWeapon,
    ammoSpent,
    minimumUsableAmmo,
    practicalVaultsSolvable,
    sectionReports,
    vaultReports,
  };
}

function buildLevelCandidate(level, { finishZ, runSeed, attempt }) {
  const random = rng(mixSeed(level, runSeed, attempt));
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
  let expectedWeaponIndex = 0;
  let healthVaultUsed = false;
  let previousVaultWasHealth = false;
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
      const makeHealthVault = level > 1 && vaultIndex >= 2 && !healthVaultUsed && !previousVaultWasHealth && random() < 0.2;
      const reward = makeHealthVault
        ? {
            type: "health",
            amount: Math.ceil(maxHealthForLevel(level) * 0.35),
            weaponIndex: expectedWeaponIndex,
          }
        : {
            type: "weapon",
            amount: 0,
            weaponIndex: rewardWeapon,
          };
      vaultIndex += 1;
      for (let g = 0; g < gateCount; g += 1) {
        const baseHp = 14 + hard * 4.4 + i * 2.1 + g * (5 + hard * 0.55);
        const hp = scaleVaultGateHp(baseHp, reward, { hard, gateIndex: g, sectionIndex: i, currentWeaponIndex: expectedWeaponIndex });
        sectionsOut[sectionsOut.length - 1].decrementGates.push({
          x: rewardLane,
          z: z - spacing * (0.22 + g * 0.14),
          hp,
          rewardType: reward.type,
          rewardWeaponIndex: reward.weaponIndex,
          rewardId: `s${i}`,
          index: g,
          total: gateCount,
        });
      }
      balanceVaultGateHp(sectionsOut[sectionsOut.length - 1].decrementGates, reward, expectedWeaponIndex);
      rewardPickups.push({
        id: `s${i}`,
        x: rewardLane,
        z: z - spacing * (0.22 + gateCount * 0.14 + 0.08),
        type: reward.type,
        amount: reward.amount,
        weaponIndex: reward.weaponIndex,
      });
      if (reward.type === "weapon") expectedWeaponIndex = Math.max(expectedWeaponIndex, reward.weaponIndex);
      if (reward.type === "health") healthVaultUsed = true;
      previousVaultWasHealth = reward.type === "health";
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
  return { theme, bossType, sections: sectionsOut, weaponPickups, rewardPickups, coins, obstacles, expectedAmmo, startAmmo, bossHp, runSeed };
}

function softenLevel(levelData, analysis) {
  const deficit = Math.max(0, analysis.minimumUsableAmmo - analysis.finalAmmo);
  const cushion = Math.max(60, Math.ceil(levelData.bossHp * 0.08));
  levelData.startAmmo += deficit + cushion;
  levelData.expectedAmmo = simulateBestPath(levelData.startAmmo, levelData.sections.filter((section) => section.gates).map((section) => section.gates));
  return levelData;
}

export function generateLevel(level, { finishZ = -292, seed, maxAttempts = 10 } = {}) {
  const runSeed = seed === undefined ? makeRunSeed() : seed >>> 0;
  let fallback = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = buildLevelCandidate(level, { finishZ, runSeed, attempt });
    const analysis = analyzeLevelSolvability(candidate);
    candidate.solvability = analysis;
    if (analysis.solvable) return candidate;
    fallback = candidate;
  }

  const analysis = analyzeLevelSolvability(fallback);
  const softened = softenLevel(fallback, analysis);
  softened.solvability = analyzeLevelSolvability(softened);
  return softened;
}
