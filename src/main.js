import * as THREE from "three";
import { AnimationController } from "./animation.js";
import { initAudio, isAudioEnabled, playSound, playWeaponSound, setAudioEnabled, startLoop, stopLoop } from "./audio.js";
import { ENEMY_TYPES, WEAPONS, generateLevel } from "./level-generator.js";

const canvas = document.querySelector("#game");
const levelEl = document.querySelector("#level");
const ammoEl = document.querySelector("#ammo");
const healthEl = document.querySelector("#health");
const weaponEl = document.querySelector("#weapon");
const coinsEl = document.querySelector("#coins");
const toastEl = document.querySelector("#toast");
const bossPanel = document.querySelector("#boss-panel");
const bossFill = document.querySelector("#boss-fill");
const menu = document.querySelector("#menu");
const result = document.querySelector("#result");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const startButton = document.querySelector("#start");
const restartButton = document.querySelector("#restart");
const audioToggle = document.querySelector("#audio-toggle");
const shopCoinsEl = document.querySelector("#shop-coins");
const shopGrid = document.querySelector("#shop-grid");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd3ff);
scene.fog = new THREE.Fog(0x8fd3ff, 55, 210);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 360);
camera.position.set(0, 9, 13);

const hemi = new THREE.HemisphereLight(0xffffff, 0x536575, 2.2);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 3.7);
sun.position.set(-8, 16, 10);
sun.castShadow = true;
sun.shadow.camera.left = -22;
sun.shadow.camera.right = 22;
sun.shadow.camera.top = 26;
sun.shadow.camera.bottom = -34;
scene.add(sun);

const laneWidth = 7.4;
const trackLength = 860;
const finishZ = -812;
const bossZ = -834;
const squadSize = 3;
const bossVisibleActivationRange = 190;
const baseRunSpeed = 12.8;
const baseMaxHealth = 100;
const levelHealthBonusCap = 40;
const ammoUpgradeBonus = 120;
const healthUpgradeBonus = 15;
const fireRateUpgradePercent = 6;
const speedUpgradePercent = 4;

const upgradeDefinitions = [
  {
    id: "ammo",
    name: "Ammo Pack",
    maxLevel: 8,
    baseCost: 300,
    costScale: 1.7,
    effect: `+${ammoUpgradeBonus} starting ammo`,
  },
  {
    id: "health",
    name: "Armor Plating",
    maxLevel: 6,
    baseCost: 450,
    costScale: 1.85,
    effect: `+${healthUpgradeBonus} max health`,
  },
  {
    id: "fireRate",
    name: "Trigger Kit",
    maxLevel: 5,
    baseCost: 900,
    costScale: 2.1,
    effect: `-${fireRateUpgradePercent}% weapon cooldown`,
  },
  {
    id: "speed",
    name: "Sprint Boots",
    maxLevel: 4,
    baseCost: 700,
    costScale: 2,
    effect: `+${speedUpgradePercent}% run speed`,
  },
];

const state = {
  phase: "menu",
  level: 1,
  runSeed: 0,
  coins: 0,
  upgrades: {
    ammo: 0,
    health: 0,
    fireRate: 0,
    speed: 0,
  },
  ammo: 60,
  health: 100,
  maxHealth: 100,
  invulnerableTimer: 0,
  speed: 12.8,
  playerX: 0,
  targetX: 0,
  playerZ: 0,
  distance: 0,
  bossHp: 0,
  maxBossHp: 0,
  bossShieldHp: 0,
  maxBossShieldHp: 0,
  bossEnraged: false,
  bossAttackIndex: 0,
  bossAttackTimer: 0,
  bossWindupTimer: 0,
  bossTurretTimer: 0,
  bossTurretIndex: 0,
  bossVisibleActive: false,
  fireCooldown: 0,
  weaponIndex: 0,
  failReason: "",
  toastTimer: 0,
  hitFlashTimer: 0,
  shakeTimer: 0,
  currentLevelData: null,
};

const materials = {
  track: new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.82 }),
  lane: new THREE.MeshStandardMaterial({ color: 0x98f1ff, roughness: 0.55, transparent: true, opacity: 0.36 }),
  rail: new THREE.MeshStandardMaterial({ color: 0x1d2a35, roughness: 0.66 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x61b96e, roughness: 0.92 }),
  player: new THREE.MeshStandardMaterial({ color: 0x38d878, roughness: 0.45 }),
  playerAlt: new THREE.MeshStandardMaterial({ color: 0x21a8ff, roughness: 0.45 }),
  visor: new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.18 }),
  weapon: new THREE.MeshStandardMaterial({ color: 0x151b22, metalness: 0.25, roughness: 0.35 }),
  muzzle: new THREE.MeshStandardMaterial({ color: 0xffd45a, emissive: 0xffaa22, emissiveIntensity: 0.8 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0xf75d5d, roughness: 0.48 }),
  enemyHeavy: new THREE.MeshStandardMaterial({ color: 0xc63fe8, roughness: 0.5 }),
  enemyShield: new THREE.MeshStandardMaterial({ color: 0xff8f3d, roughness: 0.42 }),
  boss: new THREE.MeshStandardMaterial({ color: 0x6c4ad7, roughness: 0.5 }),
  enemyWeapon: new THREE.MeshStandardMaterial({ color: 0x241926, metalness: 0.2, roughness: 0.4 }),
  enemyEye: new THREE.MeshStandardMaterial({ color: 0xfff2a6, emissive: 0xff7a2e, emissiveIntensity: 0.9 }),
  gatePanel: new THREE.MeshStandardMaterial({
    color: 0x2089ff,
    roughness: 0.25,
    transparent: true,
    opacity: 0.7,
  }),
  decrementPanel: new THREE.MeshStandardMaterial({
    color: 0x1b75ff,
    emissive: 0x0b55dd,
    emissiveIntensity: 0.42,
    roughness: 0.22,
    transparent: true,
    opacity: 0.82,
  }),
  lockedReward: new THREE.MeshStandardMaterial({ color: 0x73e8ff, emissive: 0x126dff, emissiveIntensity: 0.36, roughness: 0.35 }),
  obstacle: new THREE.MeshStandardMaterial({ color: 0xf7c85c, roughness: 0.5 }),
  coin: new THREE.MeshStandardMaterial({ color: 0xffd45a, metalness: 0.15, roughness: 0.25 }),
  projectile: new THREE.MeshStandardMaterial({ color: 0xf7fbff, emissive: 0x61d8ff, emissiveIntensity: 1.2 }),
  enemyProjectile: new THREE.MeshStandardMaterial({ color: 0xff6a3d, emissive: 0xff2a12, emissiveIntensity: 1.2 }),
};

const world = new THREE.Group();
const squadGroup = new THREE.Group();
const levelGroup = new THREE.Group();
const projectileGroup = new THREE.Group();
const dressingGroup = new THREE.Group();
scene.add(world, dressingGroup, squadGroup, levelGroup, projectileGroup);

const track = new THREE.Mesh(new THREE.BoxGeometry(laneWidth + 1.2, 0.42, trackLength), materials.track);
track.position.set(0, -0.25, -trackLength / 2 + 7);
track.receiveShadow = true;
world.add(track);

const ground = new THREE.Mesh(new THREE.BoxGeometry(34, 0.22, trackLength + 28), materials.grass);
ground.position.set(0, -0.5, -trackLength / 2 + 4);
ground.receiveShadow = true;
world.add(ground);
track.renderOrder = 1;

for (const x of [-laneWidth / 2 - 0.75, laneWidth / 2 + 0.75]) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, trackLength), materials.rail);
  rail.position.set(x, 0.08, -trackLength / 2 + 7);
  rail.receiveShadow = true;
  world.add(rail);
}

for (let z = -10; z > finishZ; z -= 18) {
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 7.5), materials.lane);
  stripe.position.set(0, 0.02, z);
  world.add(stripe);
}

for (let z = -14; z > finishZ - 20; z -= 22) {
  for (const x of [-7.6, 7.6]) {
    const pylon = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.1, 8), materials.rail);
    base.position.y = 0.42;
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), materials.coin);
    top.position.y = 1.08;
    pylon.add(base, top);
    pylon.position.set(x, 0, z);
    world.add(pylon);
  }
}

const finish = new THREE.Mesh(new THREE.BoxGeometry(laneWidth + 1.4, 0.12, 1.3), materials.coin);
finish.position.set(0, 0.03, finishZ);
world.add(finish);

let boss;
let bossShieldBar;

const squadMembers = [];
let squadAmmoLabel;
let squadHealthBar;
let squadTierLabel;
const collidables = [];
const coins = [];
const gates = [];
const decrementGates = [];
const enemies = [];
const weaponPickups = [];
const rewardPickups = [];
const projectiles = [];
const textCanvases = new Map();
const reusableVectors = {
  one: new THREE.Vector3(),
  two: new THREE.Vector3(),
};
const atlasTexture = new THREE.TextureLoader().load("./assets/sprite-atlas.png");
atlasTexture.colorSpace = THREE.SRGBColorSpace;
const bossCombatTexture = new THREE.TextureLoader().load("./assets/enemy-boss-combat-sheet.png");
bossCombatTexture.colorSpace = THREE.SRGBColorSpace;
const runnerTexture = new THREE.TextureLoader().load("./assets/player-runner-sheet.png");
runnerTexture.colorSpace = THREE.SRGBColorSpace;
const powerTexture = new THREE.TextureLoader().load("./assets/player-power-tiers.png");
powerTexture.colorSpace = THREE.SRGBColorSpace;

const atlasSize = { width: 1536, height: 1024 };
const bossCombatSize = { width: 1536, height: 1024 };
const bossCombatCell = { width: bossCombatSize.width / 8, height: bossCombatSize.height / 6 };
const atlasRegions = {
  hero: { x: 32, y: 130, w: 260, h: 420 },
  grunt: { x: 305, y: 172, w: 275, h: 378 },
  shield: { x: 588, y: 165, w: 285, h: 390 },
  heavy: { x: 882, y: 160, w: 315, h: 405 },
  boss: { x: 1190, y: 82, w: 335, h: 480 },
  coin: { x: 70, y: 690, w: 170, h: 180 },
  playerBullet: { x: 292, y: 704, w: 230, h: 115 },
  enemyBullet: { x: 570, y: 704, w: 230, h: 115 },
  flash: { x: 832, y: 640, w: 310, h: 235 },
  explosion: { x: 1146, y: 615, w: 355, h: 315 },
};
const runnerSheetSize = { width: 1536, height: 1024 };
const powerSheetSize = { width: 1408, height: 1136 };
const powerCell = { width: powerSheetSize.width / 5, height: powerSheetSize.height / 4 };
const runnerRegions = {};
for (let tier = 0; tier < 5; tier += 1) {
  ["run1", "run2", "shoot1", "shoot2"].forEach((name, row) => {
    runnerRegions[`t${tier}_${name}`] = {
      x: tier * powerCell.width + 18,
      y: row * powerCell.height + 12,
      w: powerCell.width - 36,
      h: powerCell.height - 20,
    };
  });
}

const weapons = WEAPONS;

function makeAtlasMaterial(regionName) {
  const region = atlasRegions[regionName];
  const texture = atlasTexture.clone();
  texture.repeat.set(region.w / atlasSize.width, region.h / atlasSize.height);
  texture.offset.set(region.x / atlasSize.width, 1 - (region.y + region.h) / atlasSize.height);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.05,
  });
  return material;
}

function makeBossCombatMaterial(bossType, visualState = "idle") {
  const frameByState = {
    idle: 0,
    enrageIdle: 1,
    enrage: 1,
    attack: 2,
    shield: 2,
    hit: 3,
    death: 3,
  };
  const frame = frameByState[visualState] ?? 0;
  const region = {
    x: (bossType.combatCol + frame) * bossCombatCell.width,
    y: bossType.combatRow * bossCombatCell.height,
    w: bossCombatCell.width,
    h: bossCombatCell.height,
  };
  const texture = bossCombatTexture.clone();
  texture.repeat.set(region.w / bossCombatSize.width, region.h / bossCombatSize.height);
  texture.offset.set(region.x / bossCombatSize.width, 1 - (region.y + region.h) / bossCombatSize.height);
  texture.needsUpdate = true;
  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.05,
  });
}

function makeAtlasSprite(regionName, width, height) {
  const sprite = new THREE.Sprite(makeAtlasMaterial(regionName));
  sprite.scale.set(width, height, 1);
  return sprite;
}

function makeHostileProjectileSprite({ color, width, height, glow = 0.28 }) {
  const projectile = makeAtlasSprite("enemyBullet", width, height);
  projectile.material.color.setHex(color);
  projectile.material.opacity = 0.98;
  projectile.renderOrder = 4;

  if (glow > 0) {
    const aura = makeAtlasSprite("flash", width * 1.9, height * 1.7);
    aura.material.color.setHex(color);
    aura.material.opacity = glow;
    aura.position.z = -0.01;
    aura.renderOrder = 3;
    projectile.add(aura);
    projectile.userData.aura = aura;
  }

  return projectile;
}

function makeRunnerMaterial(regionName) {
  const region = runnerRegions[regionName];
  const texture = powerTexture.clone();
  texture.repeat.set(region.w / powerSheetSize.width, region.h / powerSheetSize.height);
  texture.offset.set(region.x / powerSheetSize.width, 1 - (region.y + region.h) / powerSheetSize.height);
  texture.needsUpdate = true;
  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.05,
  });
}

function setRunnerFrame(sprite, frame) {
  const region = runnerRegions[frame];
  const texture = sprite.material.map;
  texture.repeat.set(region.w / powerSheetSize.width, region.h / powerSheetSize.height);
  texture.offset.set(region.x / powerSheetSize.width, 1 - (region.y + region.h) / powerSheetSize.height);
  texture.needsUpdate = true;
  sprite.userData.frame = frame;
}

function makeShadow(width = 0.9, depth = 0.45) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 28),
    new THREE.MeshBasicMaterial({ color: 0x05080b, transparent: true, opacity: 0.24, depthWrite: false }),
  );
  shadow.scale.set(width, depth, 1);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.035;
  return shadow;
}

boss = createBoss();
boss.position.set(0, 0, bossZ);
world.add(boss);

function applyTheme(theme) {
  scene.background.setHex(theme.sky);
  scene.fog.color.setHex(theme.fog);
  materials.track.color.setHex(theme.track);
  materials.grass.color.setHex(theme.ground);
  materials.rail.color.setHex(theme.rail);
  materials.lane.color.setHex(theme.lane);
  materials.gatePanel.color.setHex(theme.gate);
  hemi.groundColor.setHex(theme.ground);
  while (dressingGroup.children.length) dressingGroup.remove(dressingGroup.children[0]);

  for (let z = -20; z > finishZ - 18; z -= 18) {
    for (const side of [-1, 1]) {
      const mast = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.2, 8), materials.rail);
      post.position.y = 0.95;
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 10),
        new THREE.MeshBasicMaterial({ color: (Math.floor(Math.abs(z)) / 18) % 2 ? theme.propA : theme.propB, transparent: true, opacity: 0.9 }),
      );
      glow.position.y = 2.08;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.22), materials.lane);
      fin.position.y = 1.55;
      mast.add(post, glow, fin);
      mast.position.set(side * (laneWidth / 2 + 2.2), 0, z);
      dressingGroup.add(mast);
    }
  }
}

function createTextTexture(text, size = 112) {
  const key = `${text}:${size}`;
  if (!textCanvases.has(key)) {
    const canvasText = document.createElement("canvas");
    canvasText.width = 512;
    canvasText.height = 256;
    const ctx = canvasText.getContext("2d");
    ctx.clearRect(0, 0, canvasText.width, canvasText.height);
    ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 16;
    ctx.strokeStyle = "rgba(0,0,0,0.48)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(text, 256, 132);
    ctx.fillText(text, 256, 132);
    const texture = new THREE.CanvasTexture(canvasText);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textCanvases.set(key, texture);
  }
  return textCanvases.get(key);
}

function makeTextSprite(text, size = 1.25) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: createTextTexture(text), transparent: true }));
  sprite.scale.set(size * 2.5, size * 1.25, 1);
  return sprite;
}

function makeHpLabel(value, size = 0.8) {
  const canvasText = document.createElement("canvas");
  canvasText.width = 256;
  canvasText.height = 128;
  const texture = new THREE.CanvasTexture(canvasText);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size * 2, size, 1);
  sprite.userData = { canvasText, texture, last: null };
  updateHpLabel(sprite, value);
  return sprite;
}

function makeHealthBar(width = 2.1) {
  const group = new THREE.Group();
  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.18),
    new THREE.MeshBasicMaterial({ color: 0x111821, transparent: true, opacity: 0.82, depthWrite: false }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.08, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x38d878, transparent: true, opacity: 0.95, depthWrite: false }),
  );
  fill.position.set(-(width - 0.08) / 2, 0, 0.01);
  fill.geometry.translate((width - 0.08) / 2, 0, 0);
  group.add(bg, fill);
  group.userData = { fill, width: width - 0.08 };
  return group;
}

function updateHealthBar(bar, health, maxHealth) {
  const ratio = THREE.MathUtils.clamp(health / maxHealth, 0, 1);
  bar.userData.fill.scale.x = ratio;
  const color = ratio > 0.6 ? 0x38d878 : ratio > 0.3 ? 0xffd45a : 0xff4a4a;
  bar.userData.fill.material.color.setHex(color);
}

function updateShieldBar(bar, shield, maxShield) {
  if (!bar) return;
  const hasShield = maxShield > 0 && shield > 0;
  bar.visible = hasShield;
  const ratio = hasShield ? THREE.MathUtils.clamp(shield / maxShield, 0, 1) : 0;
  bar.userData.fill.scale.x = ratio;
  bar.userData.fill.material.color.setHex(ratio > 0.45 ? 0x73e8ff : 0xffd45a);
}

function updateHpLabel(sprite, value) {
  const next = `${Math.max(0, Math.ceil(value))}`;
  if (sprite.userData.last === next) return;
  sprite.userData.last = next;
  const ctx = sprite.userData.canvasText.getContext("2d");
  ctx.clearRect(0, 0, 256, 128);
  ctx.fillStyle = "rgba(15, 19, 25, 0.78)";
  roundRect(ctx, 28, 22, 200, 76, 22);
  ctx.fill();
  ctx.font = "900 58px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.fillStyle = "#ffffff";
  ctx.strokeText(next, 128, 62);
  ctx.fillText(next, 128, 62);
  sprite.userData.texture.needsUpdate = true;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function createSquadMember(index) {
  const member = new THREE.Group();
  const shadow = makeShadow(0.85, 0.42);
  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.55, 32),
    new THREE.MeshBasicMaterial({ color: 0x9cf7ff, transparent: true, opacity: 0.32, depthWrite: false }),
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.045;
  const isLead = index === 1;
  const sprite = new THREE.Sprite(makeRunnerMaterial("t0_run1"));
  sprite.scale.set(isLead ? 1.18 : 1.02, isLead ? 1.84 : 1.6, 1);
  sprite.position.y = isLead ? 0.98 : 0.84;
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.18, 0.86, -0.64);
  const flash = makeAtlasSprite("flash", 0.55, 0.38);
  flash.position.set(0.25, 0.9, -0.72);
  flash.visible = false;
  member.add(shadow, aura, sprite, muzzle, flash);
  member.userData = {
    muzzle,
    flash,
    flashTimer: 0,
    sprite,
    aura,
    controller: new AnimationController({
      frames: {
        run: ["run1", "run2", "run1", "run2"],
        shootRun: ["shoot1", "run2", "shoot2", "run1"],
        upgrade: ["shoot1", "shoot2", "run1", "run2"],
        hit: ["shoot1", "run1"],
      },
      frameDuration: 0.095,
    }),
    lastWeaponId: "carbine",
  };
  return member;
}

function createBoss() {
  const group = new THREE.Group();
  const shadow = makeShadow(2.5, 0.78);
  const sprite = makeAtlasSprite("boss", 3.8, 4.95);
  sprite.position.y = 2.38;
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.56, 1.6, -0.95);
  const aura = new THREE.Mesh(
    new THREE.RingGeometry(1.65, 2.05, 64),
    new THREE.MeshBasicMaterial({ color: 0xff4bd8, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.08;
  const label = makeHpLabel(0, 1.05);
  label.position.set(0, 5.0, 0);
  const shieldBar = makeHealthBar(2.8);
  shieldBar.position.set(0, 4.68, 0);
  shieldBar.visible = false;
  group.add(shadow, aura, sprite, muzzle, label, shieldBar);
  group.userData = { label, muzzle, type: "boss", sprite, aura, shieldBar, visualState: "idle", visualTimer: 0 };
  return group;
}

function currentWeapon() {
  return weapons[state.weaponIndex] ?? weapons[0];
}

function currentBossType() {
  return state.currentLevelData?.bossType;
}

function roundUpgradeCost(value) {
  const step = value < 1000 ? 10 : value < 10000 ? 50 : 100;
  return Math.ceil(value / step) * step;
}

function upgradeCost(definition, level = state.upgrades[definition.id] ?? 0) {
  return roundUpgradeCost(definition.baseCost * Math.pow(definition.costScale, level));
}

function getAmmoUpgradeBonus() {
  return (state.upgrades.ammo ?? 0) * ammoUpgradeBonus;
}

function getHealthUpgradeBonus() {
  return (state.upgrades.health ?? 0) * healthUpgradeBonus;
}

function getSpeedMultiplier() {
  return 1 + ((state.upgrades.speed ?? 0) * speedUpgradePercent) / 100;
}

function getFireCooldownMultiplier() {
  return Math.max(0.62, 1 - ((state.upgrades.fireRate ?? 0) * fireRateUpgradePercent) / 100);
}

function upgradeSummary(definition) {
  const level = state.upgrades[definition.id] ?? 0;
  if (definition.id === "ammo") return `Current bonus +${level * ammoUpgradeBonus} ammo. Next: ${definition.effect}.`;
  if (definition.id === "health") return `Current bonus +${level * healthUpgradeBonus} health. Next: ${definition.effect}.`;
  if (definition.id === "fireRate") return `Current bonus -${level * fireRateUpgradePercent}% cooldown. Next: ${definition.effect}.`;
  return `Current bonus +${level * speedUpgradePercent}% speed. Next: ${definition.effect}.`;
}

function updateCoinDisplays() {
  coinsEl.textContent = state.coins;
  if (shopCoinsEl) shopCoinsEl.textContent = state.coins;
}

function addCoins(amount) {
  state.coins = Math.max(0, Math.floor(state.coins + amount));
  updateCoinDisplays();
  if (state.phase === "result") renderShop();
}

function spendCoins(amount) {
  const cost = Math.floor(amount);
  if (state.coins < cost) return false;
  state.coins -= cost;
  updateCoinDisplays();
  renderShop();
  return true;
}

function renderShop() {
  if (!shopGrid) return;
  if (shopCoinsEl) shopCoinsEl.textContent = state.coins;
  shopGrid.replaceChildren(
    ...upgradeDefinitions.map((definition) => {
      const level = state.upgrades[definition.id] ?? 0;
      const maxed = level >= definition.maxLevel;
      const cost = maxed ? 0 : upgradeCost(definition, level);
      const canBuy = !maxed && state.coins >= cost;
      const item = document.createElement("article");
      item.className = "shop-upgrade";

      const copy = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = definition.name;
      const detail = document.createElement("p");
      detail.textContent = maxed ? `Maximum upgrade reached. ${definition.effect}.` : upgradeSummary(definition);
      const tier = document.createElement("span");
      tier.className = "tier";
      tier.textContent = `${level}/${definition.maxLevel}`;
      copy.append(title, detail, tier);

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.upgradeId = definition.id;
      button.disabled = !canBuy;
      button.textContent = maxed ? "Maxed" : `${cost} coins`;
      button.setAttribute("aria-label", maxed ? `${definition.name} maxed` : `Buy ${definition.name} for ${cost} coins`);

      item.append(copy, button);
      return item;
    }),
  );
}

function purchaseUpgrade(upgradeId) {
  const definition = upgradeDefinitions.find((item) => item.id === upgradeId);
  if (!definition) return;
  const level = state.upgrades[upgradeId] ?? 0;
  if (level >= definition.maxLevel) return;
  const cost = upgradeCost(definition, level);
  if (!spendCoins(cost)) {
    playSound("gateBad", { cooldown: 0.12 });
    showToast("Need More Coins");
    return;
  }
  state.upgrades[upgradeId] = level + 1;
  if (upgradeId === "health") {
    state.maxHealth += healthUpgradeBonus;
    setHealth(state.health + healthUpgradeBonus);
  }
  playSound(upgradeId === "fireRate" ? "weapon" : "gateGood", { cooldown: 0.12 });
  showToast(definition.name);
  renderShop();
}

function setBossVisualState(visualState, duration = 0.16) {
  const bossType = currentBossType();
  if (!bossType || !boss.userData.sprite) return;
  boss.userData.visualState = visualState;
  boss.userData.visualTimer = Math.max(boss.userData.visualTimer ?? 0, duration);
  boss.userData.sprite.material.map = makeBossCombatMaterial(bossType, visualState).map;
  boss.userData.sprite.material.color.setHex(0xffffff);
}

function restoreBossIdleVisual() {
  const bossType = currentBossType();
  if (!bossType || !boss.userData.sprite) return;
  boss.userData.visualState = state.bossEnraged ? "enrageIdle" : "idle";
  boss.userData.sprite.material.map = makeBossCombatMaterial(bossType, boss.userData.visualState).map;
  boss.userData.sprite.material.color.setHex(0xffffff);
}

function applyOperation(count, op) {
  if (op.type === "add") return count + op.value;
  if (op.type === "subtract") return Math.max(0, count - op.value);
  if (op.type === "multiply") return Math.floor(count * op.value);
  if (op.type === "divide") return Math.max(0, Math.floor(count / op.value));
  return count;
}

function opLabel(op) {
  const symbols = { add: "+", subtract: "-", multiply: "x", divide: "÷" };
  return `${symbols[op.type]}${op.value}`;
}

function setAmmo(value) {
  state.ammo = Math.max(0, Math.min(9999, Math.floor(value)));
  ammoEl.textContent = state.ammo;
  weaponEl.textContent = currentWeapon().name;
  if (squadAmmoLabel) updateHpLabel(squadAmmoLabel, state.ammo);
}

function setHealth(value) {
  state.health = THREE.MathUtils.clamp(Math.ceil(value), 0, state.maxHealth);
  healthEl.textContent = state.health;
  if (squadHealthBar) updateHealthBar(squadHealthBar, state.health, state.maxHealth);
}

function damagePlayer(amount) {
  if (state.invulnerableTimer > 0 || state.phase === "result") return;
  setHealth(state.health - amount);
  state.invulnerableTimer = 0.22;
  state.shakeTimer = Math.max(state.shakeTimer, 0.16);
  playSound("playerHit", { cooldown: 0.12 });
  if (state.health <= state.maxHealth * 0.25) playSound("lowAmmo", { cooldown: 0.8 });
  showToast(`-${amount} HP`);
  squadMembers.forEach((member) => member.userData.controller.setState("hit", { lockFor: 0.18, restart: true }));
  if (state.health <= 0) {
    state.failReason = "Squad Down";
    finishRun(false);
  }
}

function setWeapon(index) {
  const previous = state.weaponIndex;
  state.weaponIndex = THREE.MathUtils.clamp(index, 0, weapons.length - 1);
  weaponEl.textContent = currentWeapon().name;
  if (squadTierLabel) updateHpLabel(squadTierLabel, state.weaponIndex + 1);
  if (state.weaponIndex > previous) playSound("weapon", { pitch: 1 + state.weaponIndex * 0.12, cooldown: 0.12 });
}

function makeGate(x, z, op, width = 2.55) {
  const gate = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 2.7, 0.16), materials.gatePanel);
  panel.position.y = 1.55;
  panel.castShadow = true;
  gate.add(panel);

  const frameGeo = new THREE.BoxGeometry(0.12, 3.1, 0.22);
  for (const sx of [-width / 2, width / 2]) {
    const post = new THREE.Mesh(frameGeo, materials.rail);
    post.position.set(sx, 1.55, 0);
    gate.add(post);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.24, 0.16, 0.24), materials.rail);
  top.position.y = 3.12;
  gate.add(top);

  const label = makeTextSprite(opLabel(op), 1.05);
  label.position.set(0, 1.72, 0.14);
  gate.add(label);
  gate.position.set(x, 0, z);
  gate.userData = { op, hit: false, width };
  levelGroup.add(gate);
  gates.push(gate);
}

function makeDecrementGate(x, z, hp, rewardId, index = 0, total = 1, width = 2.55) {
  const gate = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 2.7, 0.16), materials.gatePanel.clone());
  panel.position.y = 1.55;
  panel.castShadow = true;
  gate.add(panel);

  const frameGeo = new THREE.BoxGeometry(0.12, 3.1, 0.22);
  for (const sx of [-width / 2, width / 2]) {
    const post = new THREE.Mesh(frameGeo, materials.rail);
    post.position.set(sx, 1.55, 0);
    gate.add(post);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.24, 0.16, 0.24), materials.rail);
  top.position.y = 3.12;
  gate.add(top);

  const label = makeHpLabel(hp, 0.9);
  label.position.set(0, 1.72, 0.14);
  const caption = makeTextSprite(`LOCK ${index + 1}/${total}`, 0.34);
  caption.position.set(0, 2.72, 0.16);
  gate.add(label, caption);
  gate.position.set(x, 0, z);
  gate.userData = {
    hp,
    maxHp: hp,
    width,
    label,
    panel,
    rewardId,
    type: "decrementGate",
    active: true,
    hit: false,
    flash: 0,
  };
  levelGroup.add(gate);
  decrementGates.push(gate);
}

function makeWeaponPickup(x, z, weaponIndex) {
  const weapon = weapons[weaponIndex];
  const pickup = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.18, 1.15),
    new THREE.MeshStandardMaterial({ color: weapon.color, emissive: weapon.color, emissiveIntensity: 0.24, roughness: 0.35 }),
  );
  base.position.y = 0.12;
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1, 0.62, 0.42), materials.weapon);
  crate.position.y = 0.58;
  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.86), materials.muzzle);
  barrel.position.set(0.42, 0.63, -0.34);
  const label = makeTextSprite(weapon.name.replace("Pulse ", ""), 0.42);
  label.position.set(0, 1.2, 0);
  pickup.add(base, crate, barrel, label);
  pickup.position.set(x, 0, z);
  pickup.userData = { hit: false, weaponIndex };
  levelGroup.add(pickup);
  weaponPickups.push(pickup);
}

function makeRewardPickup({ id, x, z, type, amount = 0, weaponIndex = 1 }) {
  const weapon = weapons[weaponIndex] ?? weapons[1];
  const pickup = new THREE.Group();
  const isHealth = type === "health";
  const color = isHealth ? 0x38d878 : weapon.color;
  const base = new THREE.Mesh(
    isHealth ? new THREE.CylinderGeometry(0.78, 0.96, 0.22, 18) : new THREE.CylinderGeometry(0.76, 0.94, 0.22, 6),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.32, roughness: 0.3 }),
  );
  base.position.y = 0.18;
  const core = new THREE.Mesh(
    isHealth ? new THREE.BoxGeometry(0.92, 0.62, 0.58) : new THREE.BoxGeometry(1.05, 0.55, 0.52),
    isHealth ? new THREE.MeshStandardMaterial({ color: 0xf7fbff, roughness: 0.32 }) : materials.weapon,
  );
  core.position.y = 0.7;
  if (isHealth) {
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xff4a6a, emissive: 0xff4a6a, emissiveIntensity: 0.28, roughness: 0.28 });
    const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.08), crossMat);
    const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.08), crossMat);
    crossA.position.set(0, 0.73, -0.32);
    crossB.position.set(0, 0.73, -0.33);
    pickup.add(crossA, crossB);
  } else {
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.96), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 }));
    barrel.position.set(0.42, 0.72, -0.36);
    pickup.add(barrel);
  }
  const labelText = isHealth ? `+${amount} HP` : weapon.name.replace("Pulse ", "");
  const label = makeTextSprite(labelText, 0.42);
  label.position.set(0, 1.28, 0);
  pickup.add(base, core, label);
  pickup.position.set(x, 0, z);
  pickup.visible = false;
  pickup.userData = { id, hit: false, locked: true, type, amount, weaponIndex, label };
  levelGroup.add(pickup);
  rewardPickups.push(pickup);
}

function makeObstacle(x, z, width = 1.15) {
  const obstacle = new THREE.Mesh(new THREE.BoxGeometry(width, 1.05, 1.05), materials.obstacle);
  obstacle.position.set(x, 0.54, z);
  obstacle.castShadow = true;
  obstacle.userData = { hit: false, width };
  levelGroup.add(obstacle);
  collidables.push(obstacle);
}

function makeCoin(x, z) {
  const coin = makeAtlasSprite("coin", 0.72, 0.78);
  coin.position.set(x, 0.9, z);
  coin.userData = { hit: false };
  levelGroup.add(coin);
  coins.push(coin);
}

function makeEnemy(x, z, hp, type = "grunt") {
  const enemy = new THREE.Group();
  const config = ENEMY_TYPES[type] ?? ENEMY_TYPES.grunt;
  const scale = config.scale;
  const regionName = config.sprite;
  const shadow = makeShadow(type === "heavy" ? 1.45 : 1.02, type === "heavy" ? 0.55 : 0.42);
  const sprite = makeAtlasSprite(regionName, 1.15 * scale, 1.76 * scale);
  sprite.material.color.setHex(type === "drone" ? 0x9cf7ff : type === "turret" ? 0xa7ff4f : 0xffffff);
  sprite.position.y = 0.9 * scale;
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.25 * scale, 0.9 * scale, -0.72);
  const armorColor = type === "heavy" ? 0xff5cff : type === "shield" ? 0xffd45a : type === "drone" ? 0x73e8ff : type === "turret" ? 0xa7ff4f : 0xff6a3d;
  const shoulder = new THREE.Mesh(
    new THREE.BoxGeometry(0.72 * scale, 0.16 * scale, 0.16),
    new THREE.MeshStandardMaterial({ color: armorColor, emissive: armorColor, emissiveIntensity: 0.45, roughness: 0.35 }),
  );
  shoulder.position.set(0, 1.36 * scale, -0.08);
  const warning = new THREE.Mesh(
    new THREE.RingGeometry(0.22 * scale, 0.36 * scale, 28),
    new THREE.MeshBasicMaterial({ color: armorColor, transparent: true, opacity: 0, depthWrite: false }),
  );
  warning.position.set(0.25 * scale, 1.02 * scale, -0.74);
  enemy.add(shadow, sprite, shoulder, warning, muzzle);

  const label = makeHpLabel(hp, type === "heavy" ? 0.95 : 0.78);
  label.position.set(0, type === "heavy" ? 2.45 : 2.12, 0);
  enemy.add(label);
  enemy.position.set(x, 0, z);
  enemy.userData = {
    hp,
    maxHp: hp,
    hit: false,
    type,
    width: config.width,
    label,
    flash: 0,
    active: true,
    muzzle,
    homeX: x,
    baseZ: z,
    warning,
    shootWindup: 0,
    movementTime: Math.random() * 4,
    movementStyle: type === "drone" ? "zigzag" : type === "turret" ? "turret" : type === "heavy" ? "lunge" : type === "shield" ? "blocker" : "strafe",
    strafeAmp: type === "drone" ? 1.35 : type === "grunt" ? 0.8 : type === "shield" ? 0.45 : 0.28,
    strafeSpeed: type === "drone" ? 4.8 : type === "grunt" ? 2.6 : type === "shield" ? 1.45 : 1.1,
    engagementRange: config.engagementRange,
    fireRange: config.fireRange,
    lockState: false,
    lockPulse: 0,
    shootCooldown: 0.45 + Math.random() * 0.55,
    shootEvery: Math.max(0.48, config.shootEvery * 0.9),
    shotCost: config.shotCost,
    reward: config.reward,
    anim: new AnimationController({
      frames: { advance: ["a", "b", "c", "d"], shoot: ["s", "a"], hit: ["h", "a"], death: ["d"] },
      frameDuration: 0.12,
    }),
    sprite,
  };
  levelGroup.add(enemy);
  enemies.push(enemy);
}

function clearLevel() {
  gates.length = 0;
  decrementGates.length = 0;
  collidables.length = 0;
  coins.length = 0;
  enemies.length = 0;
  weaponPickups.length = 0;
  rewardPickups.length = 0;
  projectiles.length = 0;
  while (levelGroup.children.length) levelGroup.remove(levelGroup.children[0]);
  while (projectileGroup.children.length) projectileGroup.remove(projectileGroup.children[0]);
}

function buildLevel(levelData = generateLevel(state.level, { finishZ })) {
  clearLevel();
  state.currentLevelData = levelData;
  applyTheme(levelData.theme);
  levelData.sections.forEach((section) => {
    if (section.gates) {
      makeGate(-1.85, section.z, section.gates.left);
      makeGate(1.85, section.z, section.gates.right);
    }
    section.decrementGates?.forEach((gate) => makeDecrementGate(gate.x, gate.z, gate.hp, gate.rewardId, gate.index, gate.total));
    section.enemies.forEach((enemy) => makeEnemy(enemy.x, enemy.z, enemy.hp, enemy.type));
  });
  levelData.weaponPickups.forEach((pickup) => makeWeaponPickup(pickup.x, pickup.z, pickup.weaponIndex));
  levelData.rewardPickups?.forEach((pickup) => makeRewardPickup(pickup));
  levelData.obstacles.forEach((obstacle) => makeObstacle(obstacle.x, obstacle.z, obstacle.width));
  levelData.coins.forEach((coin) => makeCoin(coin.x, coin.z));
}

function syncSquadModels() {
  while (squadMembers.length < squadSize) {
    const member = createSquadMember(squadMembers.length);
    squadGroup.add(member);
    squadMembers.push(member);
  }

  if (!squadAmmoLabel) {
    squadAmmoLabel = makeHpLabel(state.ammo, 1);
    squadAmmoLabel.position.set(0, 2.45, 0.25);
    squadGroup.add(squadAmmoLabel);
  }
  if (!squadHealthBar) {
    squadHealthBar = makeHealthBar(2.2);
    squadHealthBar.position.set(0, 2.16, 0.25);
    squadGroup.add(squadHealthBar);
  }
  if (!squadTierLabel) {
    squadTierLabel = makeHpLabel(state.weaponIndex + 1, 0.55);
    squadTierLabel.position.set(1.25, 2.45, 0.25);
    squadGroup.add(squadTierLabel);
  }

  squadMembers.forEach((member, i) => {
    const positions = [
      [-0.8, 0.42],
      [0, 0],
      [0.8, 0.42],
    ];
    member.position.set(positions[i][0], 0, positions[i][1]);
  });
}

function resetRun(nextLevel = false) {
  const carriedHealth = state.health;
  if (nextLevel) state.level += 1;
  state.runSeed = Math.floor(Math.random() * 4294967296) >>> 0;
  state.speed = baseRunSpeed * getSpeedMultiplier();
  state.playerX = 0;
  state.targetX = 0;
  state.playerZ = 0;
  state.distance = 0;
  state.fireCooldown = 0;
  state.bossAttackTimer = 0.22;
  state.bossWindupTimer = 0;
  state.bossTurretTimer = 0.36;
  state.bossTurretIndex = 0;
  state.bossAttackIndex = 0;
  state.bossEnraged = false;
  state.bossVisibleActive = false;
  state.failReason = "";
  state.invulnerableTimer = 0;
  state.maxHealth = baseMaxHealth + Math.min(levelHealthBonusCap, Math.floor((state.level - 1) * 4)) + getHealthUpgradeBonus();
  setHealth(nextLevel ? Math.min(carriedHealth, state.maxHealth) : state.maxHealth);
  setWeapon(0);
  state.toastTimer = 0;
  state.hitFlashTimer = 0;
  const levelData = generateLevel(state.level, { finishZ, seed: state.runSeed });
  levelData.startAmmo += getAmmoUpgradeBonus();
  state.maxBossHp = levelData.bossHp;
  state.bossHp = state.maxBossHp;
  state.maxBossShieldHp = Math.round(state.maxBossHp * (levelData.bossType.shieldHp ?? 0));
  state.bossShieldHp = state.maxBossShieldHp;
  levelEl.textContent = state.level;
  updateCoinDisplays();
  renderShop();
  bossPanel.style.display = "none";
  bossFill.style.width = "100%";
  toastEl.textContent = "";
  boss.position.set(0, 0, bossZ);
  const bossSprite = boss.userData.sprite;
  if (bossSprite) {
    bossSprite.material.map = makeBossCombatMaterial(levelData.bossType, "idle").map;
    bossSprite.material.color.setHex(0xffffff);
    bossSprite.scale.set(levelData.bossType.visualScale.width, levelData.bossType.visualScale.height, 1);
    bossSprite.position.y = levelData.bossType.visualScale.y;
  }
  boss.userData.visualTimer = 0;
  boss.userData.visualState = "idle";
  if (boss.userData.aura) {
    boss.userData.aura.material.color.setHex(levelData.bossType.projectileColor);
    boss.userData.aura.material.opacity = 0.24;
  }
  bossShieldBar = boss.userData.shieldBar;
  boss.scale.setScalar(1 + Math.min(0.85, state.level * 0.055));
  updateHpLabel(boss.userData.label, state.bossHp);
  updateShieldBar(bossShieldBar, state.bossShieldHp, state.maxBossShieldHp);
  buildLevel(levelData);
  setAmmo(levelData.startAmmo);
  syncSquadModels();
  squadGroup.position.set(0, 0, 0);
  result.classList.add("hidden");
}

function showToast(text) {
  toastEl.textContent = text;
  state.toastTimer = 0.85;
}

function startRun() {
  initAudio();
  playSound("start", { cooldown: 0.2 });
  startLoop("run");
  stopLoop("boss");
  menu.classList.add("hidden");
  resetRun(false);
  state.phase = "running";
}

function finishRun(won) {
  if (state.phase === "result") return;
  state.phase = "result";
  stopLoop("run");
  stopLoop("boss");
  playSound(won ? "victory" : "defeat", { cooldown: 0.4 });
  result.classList.remove("hidden");
  resultTitle.textContent = won ? "Victory" : state.failReason || "Out of Ammo";
  const reward = won ? Math.max(60, Math.floor(state.ammo * 0.35 + state.level * 38)) : Math.max(12, state.coins * 0.02 + state.level * 8);
  addCoins(Math.floor(reward));
  resultCopy.textContent = won
    ? `The boss dropped ${Math.floor(reward)} coins. Stronger enemies are moving in.`
    : state.failReason === "Enemy Breach"
      ? "An enemy reached your squad before going down. Choose stronger math and grab better weapons earlier."
      : `Your squad ran dry. Better gates and cleaner shooting will carry the next run.`;
  restartButton.textContent = won ? "Next Run" : "Retry";
  restartButton.dataset.next = won ? "true" : "false";
  renderShop();
}

function resolveGate(gate) {
  gate.userData.hit = true;
  const before = state.ammo;
  const after = applyOperation(before, gate.userData.op);
  const delta = after - before;
  setAmmo(after);
  playSound(delta >= 0 ? "gateGood" : "gateBad", { pitch: delta >= 0 ? 1.05 : 0.86, cooldown: 0.1 });
  showToast(`${opLabel(gate.userData.op)} ${delta >= 0 ? "+" : ""}${delta}`);
  gate.scale.set(1.05, 1.08, 1.05);
}

function resolveObstacle(obstacle) {
  obstacle.userData.hit = true;
  const loss = Math.max(6, Math.ceil(state.ammo * 0.08));
  setAmmo(state.ammo - loss);
  playSound("gateBad", { cooldown: 0.12 });
  showToast(`Ammo leak -${loss}`);
  obstacle.scale.set(1.25, 0.65, 1.25);
}

function collectCoin(coin) {
  coin.userData.hit = true;
  coin.visible = false;
  playSound("coin", { cooldown: 0.035 });
  addCoins(1);
}

function collectWeaponPickup(pickup) {
  pickup.userData.hit = true;
  pickup.visible = false;
  setWeapon(pickup.userData.weaponIndex);
  const burst = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.55, 48),
    new THREE.MeshBasicMaterial({ color: currentWeapon().color, transparent: true, opacity: 0.85, depthWrite: false }),
  );
  burst.rotation.x = -Math.PI / 2;
  burst.position.set(squadGroup.position.x, 0.08, squadGroup.position.z - 0.4);
  burst.userData = { effect: true, ttl: 0.42, ring: true };
  projectileGroup.add(burst);
  projectiles.push(burst);
  state.shakeTimer = Math.max(state.shakeTimer, 0.18);
  showToast(currentWeapon().name);
}

function collectRewardPickup(pickup) {
  pickup.userData.hit = true;
  pickup.visible = false;
  const { amount, type, weaponIndex } = pickup.userData;
  let burstColor = currentWeapon().color;
  if (type === "health") {
    const before = state.health;
    setHealth(state.health + amount);
    const restored = state.health - before;
    burstColor = 0x38d878;
    playSound(restored > 0 ? "gateGood" : "coin", { pitch: 1.18, cooldown: 0.12 });
    showToast(restored > 0 ? `+${restored} HP` : "Health Full");
  } else {
    setWeapon(Math.max(state.weaponIndex, weaponIndex));
    burstColor = currentWeapon().color;
    playSound("weapon", { pitch: 1 + weaponIndex * 0.16, cooldown: 0.12 });
    showToast(`${currentWeapon().name} unlocked`);
  }
  const burst = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.68, 48),
    new THREE.MeshBasicMaterial({ color: burstColor, transparent: true, opacity: 0.92, depthWrite: false }),
  );
  burst.rotation.x = -Math.PI / 2;
  burst.position.set(pickup.position.x, 0.08, pickup.position.z);
  burst.userData = { effect: true, ttl: 0.42, ring: true };
  projectileGroup.add(burst);
  projectiles.push(burst);
}

function unlockRewardIfReady(rewardId) {
  const relatedGates = decrementGates.filter((gate) => gate.userData.rewardId === rewardId);
  if (!relatedGates.length || relatedGates.some((gate) => gate.userData.active)) return;
  rewardPickups
    .filter((pickup) => pickup.userData.id === rewardId && pickup.userData.locked)
    .forEach((pickup) => {
      pickup.userData.locked = false;
      pickup.visible = true;
      playSound("gateBreak", { cooldown: 0.12 });
      const glowColor = pickup.userData.type === "health" ? 0x38d878 : 0x73e8ff;
      const glow = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.95, 48),
        new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.85, depthWrite: false }),
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(pickup.position.x, 0.09, pickup.position.z);
      glow.userData = { effect: true, ttl: 0.42, ring: true };
      projectileGroup.add(glow);
      projectiles.push(glow);
    });
}

function spawnProjectile(target, weapon) {
  const member = squadMembers[Math.floor(Math.random() * squadMembers.length)];
  member.userData.flash.visible = true;
  member.userData.flashTimer = 0.08;
  playWeaponSound(weapon.id);
  const start = reusableVectors.one;
  const targetPos = reusableVectors.two;
  member.userData.muzzle.getWorldPosition(start);
  target.getWorldPosition(targetPos);
  targetPos.y += target.userData.type === "boss" ? 1.6 : target.userData.type === "decrementGate" ? 1.35 : 0.82;

  const projectile = makeAtlasSprite(weapon.projectile, weapon.id === "laser" ? 0.95 : 0.72 + weapon.cost * 0.025, weapon.id === "laser" ? 0.58 : 0.32 + weapon.cost * 0.012);
  projectile.material.color.setHex(weapon.color);
  if (weapon.id === "overdrive") projectile.scale.multiplyScalar(1.45);
  projectile.position.copy(start);
  projectile.userData = {
    target,
    damage: weapon.damage,
    speed: 46 + weapon.cost * 2,
    spent: weapon.cost,
    weaponId: weapon.id,
    alive: true,
  };
  projectileGroup.add(projectile);
  projectiles.push(projectile);
  if (weapon.id === "cannon" || weapon.id === "laser") state.shakeTimer = Math.max(state.shakeTimer, 0.12);
  if (state.ammo < Math.max(weapon.cost * 3, 20)) playSound("lowAmmo", { cooldown: 0.9 });
}

function spawnEnemyProjectile(enemy, offsetX = 0, speedBonus = 0, damageBonus = 0) {
  const start = reusableVectors.one;
  enemy.userData.muzzle.getWorldPosition(start);
  const targetPos = new THREE.Vector3(
    squadGroup.position.x + offsetX + (Math.random() - 0.5) * 0.55,
    0.72,
    squadGroup.position.z + 0.45,
  );
  const enemyColor = enemy.userData.type === "heavy" ? 0xff5cff : enemy.userData.type === "drone" ? 0x73e8ff : enemy.userData.type === "turret" ? 0xa7ff4f : 0xff6a3d;
  const projectileSize = {
    grunt: [0.86, 0.4],
    shield: [0.95, 0.46],
    heavy: [1.28, 0.62],
    drone: [0.84, 0.38],
    turret: [1.08, 0.5],
  }[enemy.userData.type] ?? [0.86, 0.4];
  const projectile = makeHostileProjectileSprite({
    color: enemyColor,
    width: projectileSize[0],
    height: projectileSize[1],
    glow: enemy.userData.type === "heavy" ? 0.42 : enemy.userData.type === "turret" ? 0.34 : 0.26,
  });
  projectile.position.copy(start);
  const direction = targetPos.sub(start).normalize();
  const speed = (enemy.userData.type === "heavy" ? 28 : enemy.userData.type === "drone" ? 48 : enemy.userData.type === "turret" ? 38 : 35) + speedBonus;
  projectile.userData = {
    hostile: true,
    damage: enemy.userData.shotCost + damageBonus,
    velocity: direction.multiplyScalar(speed),
    radius: enemy.userData.type === "heavy" ? 0.7 : 0.48,
    ttl: 2.4,
    previousPosition: start.clone(),
    alive: true,
  };
  projectileGroup.add(projectile);
  projectiles.push(projectile);
  playSound("enemyShot", { pitch: enemy.userData.type === "drone" ? 1.25 : enemy.userData.type === "heavy" ? 0.72 : 1, cooldown: 0.04 });
}

function spawnEnemyTelegraph(enemy) {
  const length = Math.max(2.5, Math.abs(enemy.position.z - state.playerZ) - 0.8);
  const color = enemy.userData.type === "heavy" ? 0xff5cff : enemy.userData.type === "drone" ? 0x73e8ff : enemy.userData.type === "turret" ? 0xa7ff4f : 0xff6a3d;
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.035, length),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.52, depthWrite: false }),
  );
  beam.position.set(
    (enemy.position.x + state.playerX) * 0.5,
    0.72,
    (enemy.position.z + state.playerZ) * 0.5,
  );
  beam.rotation.y = Math.atan2(state.playerX - enemy.position.x, state.playerZ - enemy.position.z);
  beam.userData = { effect: true, ttl: 0.16 };
  projectileGroup.add(beam);
  projectiles.push(beam);
}

function enemyDistanceAhead(enemy) {
  return state.playerZ - enemy.position.z;
}

function enemyIsShootable(enemy) {
  const distance = enemyDistanceAhead(enemy);
  return distance >= 3 && distance <= enemy.userData.engagementRange;
}

function spawnBossProjectile(pattern = "single", offsetX = 0, damage = 12, speed = 30, radius = 0.58, options = {}) {
  const start = reusableVectors.one;
  boss.userData.muzzle.getWorldPosition(start);
  const target = new THREE.Vector3(squadGroup.position.x + offsetX, 0.76, squadGroup.position.z + 0.35);
  const color = state.currentLevelData?.bossType?.projectileColor ?? 0xff4bd8;
  const isStream = options.stream || pattern === "bossTurret";
  const projectile = makeHostileProjectileSprite({
    color,
    width: options.width ?? (isStream ? (options.preFight ? 1.35 : 1.85) : radius * 2.15),
    height: options.height ?? (isStream ? (options.preFight ? 0.56 : 0.72) : radius * 1.05),
    glow: isStream ? 0.48 : 0.36,
  });
  projectile.position.copy(start);
  const travelDistance = start.distanceTo(target);
  const direction = target.sub(start).normalize();
  projectile.userData = {
    hostile: true,
    bossShot: true,
    preFight: Boolean(options.preFight),
    pattern,
    damage,
    velocity: direction.multiplyScalar(speed),
    radius,
    hitPadding: options.hitPadding ?? (isStream ? 0.62 : 1.05),
    ttl: options.ttl ?? Math.max(3, travelDistance / Math.max(1, speed) + 0.8),
    previousPosition: start.clone(),
    alive: true,
  };
  projectileGroup.add(projectile);
  projectiles.push(projectile);
  playSound("bossShot", { pitch: pattern === "barrage" ? 1.18 : pattern === "wall" ? 0.7 : 1, cooldown: 0.035 });
}

function spawnBossTelegraph(offsetX = 0, width = 0.14) {
  const color = currentBossType()?.projectileColor ?? 0xff4bd8;
  const startZ = boss.position.z + 4.2;
  const endZ = squadGroup.position.z + 0.35;
  const length = Math.max(8.5, Math.abs(startZ - endZ));
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.045, length),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.62, depthWrite: false }),
  );
  beam.position.set((squadGroup.position.x + offsetX) * 0.5, 0.78, (startZ + endZ) * 0.5);
  beam.rotation.y = Math.atan2(squadGroup.position.x + offsetX - boss.position.x, squadGroup.position.z - boss.position.z);
  beam.userData = { effect: true, ttl: 0.14 };
  projectileGroup.add(beam);
  projectiles.push(beam);
}

function findTarget() {
  const aheadEnemies = enemies
    .filter((enemy) => enemy.userData.active && !enemy.userData.hit && enemy.userData.hp > 0)
    .filter((enemy) => enemy.position.z < state.playerZ - 3 && enemy.position.z > state.playerZ - 88)
    .sort((a, b) => b.position.z - a.position.z);

  const urgentEnemy = aheadEnemies.find((enemy) => enemy.position.z > state.playerZ - 18 && enemyIsShootable(enemy));
  if (urgentEnemy) return urgentEnemy;

  const laneGate = decrementGates
    .filter((gate) => gate.userData.active && gate.userData.hp > 0)
    .filter((gate) => Math.abs(gate.position.x - state.playerX) < gate.userData.width / 2 + 0.92)
    .filter((gate) => gate.position.z < state.playerZ - 3 && gate.position.z > state.playerZ - 64)
    .sort((a, b) => b.position.z - a.position.z)[0];
  if (laneGate) return laneGate;

  const shootableEnemies = aheadEnemies.filter(enemyIsShootable);
  const laneEnemy = shootableEnemies.find((enemy) => Math.abs(enemy.position.x - state.playerX) < enemy.userData.width + 0.95);
  if (laneEnemy) return laneEnemy;
  if (shootableEnemies.length) return shootableEnemies[0];
  if (state.phase === "boss" && state.bossHp > 0) return boss;
  return null;
}

function shootAtTarget(dt) {
  state.fireCooldown = Math.max(0, state.fireCooldown - dt);
  const target = findTarget();
  const weapon = currentWeapon();
  weaponEl.textContent = weapon.name;
  if (!target || state.fireCooldown > 0) return;
  if (state.ammo < weapon.cost) {
    state.failReason = "Out of Ammo";
    finishRun(false);
    return;
  }
  setAmmo(state.ammo - weapon.cost);
  spawnProjectile(target, weapon);
  state.fireCooldown = weapon.cooldown * getFireCooldownMultiplier();
}

function updateEnemyShooting(dt) {
  enemies.forEach((enemy) => {
    if (!enemy.userData.active || enemy.userData.hp <= 0) return;
    enemy.userData.movementTime += dt;
    if (enemy.userData.movementStyle === "zigzag") {
      enemy.position.x = enemy.userData.homeX + Math.sin(enemy.userData.movementTime * enemy.userData.strafeSpeed) * enemy.userData.strafeAmp;
      enemy.position.z = enemy.userData.baseZ + Math.sin(enemy.userData.movementTime * 5.1) * 0.45;
    } else if (enemy.userData.movementStyle === "strafe") {
      enemy.position.x = enemy.userData.homeX + Math.sin(enemy.userData.movementTime * enemy.userData.strafeSpeed) * enemy.userData.strafeAmp;
    } else if (enemy.userData.movementStyle === "blocker") {
      enemy.position.x = THREE.MathUtils.lerp(enemy.position.x, enemy.userData.homeX + Math.sin(enemy.userData.movementTime * enemy.userData.strafeSpeed) * enemy.userData.strafeAmp, 0.08);
      enemy.position.z = enemy.userData.baseZ + Math.sin(enemy.userData.movementTime * 2.2) * 0.22;
    } else if (enemy.userData.movementStyle === "lunge") {
      enemy.position.x = enemy.userData.homeX + Math.sin(enemy.userData.movementTime * 1.35) * enemy.userData.strafeAmp;
      enemy.position.z = enemy.userData.baseZ + Math.max(0, Math.sin(enemy.userData.movementTime * 2.4)) * 0.55;
    }
    enemy.position.x = THREE.MathUtils.clamp(enemy.position.x, -laneWidth / 2 + 0.45, laneWidth / 2 - 0.45);

    const distance = enemyDistanceAhead(enemy);
    const inRange = distance > 2 && distance < enemy.userData.fireRange;
    if (!inRange) return;
    if (enemy.userData.shootWindup > 0) {
      enemy.userData.shootWindup -= dt;
      enemy.userData.warning.material.opacity = 0.28 + Math.sin(performance.now() * 0.04) * 0.2;
      if (enemy.userData.shootWindup <= 0) {
        enemy.userData.warning.material.opacity = 0;
        if (enemy.userData.type === "turret") {
          [-0.55, 0, 0.55].forEach((offset) => spawnEnemyProjectile(enemy, offset, 3, 0));
        } else if (enemy.userData.type === "heavy") {
          spawnEnemyProjectile(enemy, 0, 1, 2);
          spawnEnemyProjectile(enemy, -0.75, -2, 0);
          spawnEnemyProjectile(enemy, 0.75, -2, 0);
        } else if (enemy.userData.type === "drone") {
          spawnEnemyProjectile(enemy, -0.42, 5, 0);
          spawnEnemyProjectile(enemy, 0.42, 5, 0);
        } else {
          spawnEnemyProjectile(enemy);
        }
      }
      return;
    }
    enemy.userData.shootCooldown -= dt;
    if (enemy.userData.shootCooldown <= 0) {
      enemy.userData.shootWindup = enemy.userData.type === "heavy" ? 0.28 : enemy.userData.type === "turret" ? 0.12 : 0.18;
      playSound("enemyWindup", { pitch: enemy.userData.type === "heavy" ? 0.75 : enemy.userData.type === "drone" ? 1.25 : 1, cooldown: 0.08 });
      if (enemy.userData.type === "heavy" || enemy.userData.type === "turret") spawnEnemyTelegraph(enemy);
      enemy.userData.shootCooldown = enemy.userData.shootEvery;
    }
  });
}

function updateBossAttacks(dt) {
  const preFight = state.phase === "running" && state.bossVisibleActive;
  if (!(state.phase === "boss" || preFight) || state.bossHp <= 0) return;
  const bossType = currentBossType();
  if (!bossType) return;
  const hpRatio = state.bossHp / state.maxBossHp;
  if (!preFight && !state.bossEnraged && hpRatio <= (bossType.enrageAt ?? 0.42)) {
    state.bossEnraged = true;
    state.bossAttackTimer = 0.08;
    state.shakeTimer = Math.max(state.shakeTimer, 0.45);
    setBossVisualState("enrage", 0.65);
    playSound("bossEnrage", { cooldown: 0.6 });
    showToast("Boss Enraged");
  }
  if (state.bossShieldHp > 0 && bossType.shieldRegen && state.bossWindupTimer <= 0) {
    state.bossShieldHp = Math.min(state.maxBossShieldHp, state.bossShieldHp + bossType.shieldRegen * dt);
    updateShieldBar(bossShieldBar, state.bossShieldHp, state.maxBossShieldHp);
  }

  state.bossTurretTimer -= dt;
  if (state.bossTurretTimer <= 0) {
    const level = state.level;
    const enraged = state.bossEnraged;
    const playerBias = THREE.MathUtils.clamp(squadGroup.position.x, -2.75, 2.75);
    const turretStep = state.bossTurretIndex % 6;
    const offsetPattern = preFight ? [0, -0.5, 0.5, -0.9, 0.9, 0] : [0, -0.38, 0.38, -0.74, 0.74, 0];
    const offset = THREE.MathUtils.clamp(playerBias + offsetPattern[turretStep], -3.05, 3.05);
    const turretDamage = preFight
      ? Math.max(1, Math.floor(bossType.damage * 0.24 + level * 0.18))
      : Math.max(3, Math.floor(bossType.damage * 0.42 + level * 0.34) + (enraged ? 1 : 0));
    const turretSpeed = preFight
      ? Math.max(86, bossType.projectileSpeed * 2.1)
      : bossType.projectileSpeed + 24 + (enraged ? 9 : 0);
    const turretRadius = preFight ? 0.36 : 0.42;

    setBossVisualState("attack", preFight ? 0.1 : 0.12);
    spawnBossProjectile("bossTurret", offset, turretDamage, turretSpeed, turretRadius, { preFight, stream: true });
    state.bossTurretIndex += 1;
    state.bossTurretTimer = preFight
      ? Math.max(0.34, 0.48 - Math.min(0.1, level * 0.01))
      : Math.max(0.12, (enraged ? 0.13 : 0.17) - Math.min(0.03, level * 0.002));
  }

  state.bossWindupTimer = Math.max(0, state.bossWindupTimer - dt);
  state.bossAttackTimer -= dt;
  if (state.bossAttackTimer > 0) return;

  const level = state.level;
  const patterns = bossType.patterns ?? ["turret", "fan"];
  const pattern = patterns[state.bossAttackIndex % patterns.length];
  state.bossAttackIndex += 1;
  const enraged = state.bossEnraged;
  const damage = preFight
    ? Math.max(3, Math.floor(bossType.damage * 0.45 + level * 0.35))
    : bossType.damage + Math.min(12, Math.floor(level * 1.15)) + (enraged ? 3 : 0);
  const speed = preFight ? Math.max(78, bossType.projectileSpeed * 1.9) : bossType.projectileSpeed + (enraged ? 8 : 0);
  const burstCount = preFight ? 1 + Number(level > 4 && state.bossAttackIndex % 3 === 0) : bossType.burstCount + Number(enraged);
  const playerBias = THREE.MathUtils.clamp(squadGroup.position.x, -2.6, 2.6);
  setBossVisualState("attack", 0.18);

  if (preFight) {
    const offset = playerBias + (state.bossAttackIndex % 2 === 0 ? -0.42 : 0.42);
    spawnBossTelegraph(offset, 0.12);
    spawnBossProjectile("longRange", offset, damage, speed, 0.38, { preFight: true });
    if (burstCount > 1) {
      const mirrorOffset = playerBias - (offset - playerBias);
      spawnBossTelegraph(mirrorOffset, 0.1);
      spawnBossProjectile("longRange", mirrorOffset, Math.max(2, damage - 1), speed * 0.94, 0.34, { preFight: true });
    }
    state.bossWindupTimer = 0.22;
    state.shakeTimer = Math.max(state.shakeTimer, 0.08);
    state.bossAttackTimer = Math.max(1.8, 2.4 - Math.min(0.26, level * 0.018));
    return;
  }

  if (pattern === "turret") {
    for (let i = 0; i < burstCount; i += 1) {
      const offset = playerBias + (i - (burstCount - 1) / 2) * 0.38;
      spawnBossTelegraph(offset, 0.1);
      spawnBossProjectile("turret", offset, damage, speed + i * 1.2, 0.45);
    }
  } else if (pattern === "fan") {
    const offsets = enraged ? [-2.9, -1.65, -0.55, 0.55, 1.65, 2.9] : [-2.25, -1.05, 0, 1.05, 2.25];
    offsets.forEach((offset) => {
      spawnBossTelegraph(offset, 0.12);
      spawnBossProjectile("fan", offset, Math.max(7, damage - 2), speed - 3, 0.5);
    });
  } else if (pattern === "sweep" || pattern === "spread") {
    const direction = state.bossAttackIndex % 2 === 0 ? 1 : -1;
    [-2.8, -1.8, -0.8, 0.2, 1.2, 2.2].forEach((offset, i) => {
      const laneOffset = offset * direction;
      spawnBossTelegraph(laneOffset, 0.16);
      spawnBossProjectile("sweep", laneOffset, damage, speed + i * 0.8, 0.5);
    });
  } else if (pattern === "wall") {
    [-2.7, -1.35, 0, 1.35, 2.7].forEach((offset) => {
      spawnBossTelegraph(offset, 0.2);
      spawnBossProjectile("wall", offset, damage + 2, speed - 6, 0.68);
    });
  } else if (pattern === "shieldBurst") {
    if (state.bossShieldHp <= 0) state.bossShieldHp = Math.min(state.maxBossShieldHp, state.maxBossShieldHp * 0.22);
    updateShieldBar(bossShieldBar, state.bossShieldHp, state.maxBossShieldHp);
    [-2.2, 0, 2.2].forEach((offset) => {
      spawnBossTelegraph(offset, 0.22);
      spawnBossProjectile("shieldBurst", offset, damage + 4, speed - 2, 0.7);
    });
  } else {
    for (let i = 0; i < burstCount + 2; i += 1) {
      const offset = -2.8 + Math.random() * 5.6;
      spawnBossTelegraph(offset, 0.11);
      spawnBossProjectile("barrage", offset, Math.max(6, damage - 3), speed + Math.random() * 7, 0.42);
    }
  }

  state.bossWindupTimer = 0.18;
  state.shakeTimer = Math.max(state.shakeTimer, enraged ? 0.18 : 0.11);
  state.bossAttackTimer = Math.max(0.72, (enraged ? bossType.enrageRate + 0.62 : bossType.attackRate + 0.75) - Math.min(0.08, level * 0.004));
}

function damageEnemy(enemy, amount) {
  enemy.userData.hp = Math.max(0, enemy.userData.hp - amount);
  enemy.userData.flash = 0.16;
  updateHpLabel(enemy.userData.label, enemy.userData.hp);
  if (enemy.userData.hp <= 0) {
    playSound("enemyDeath", { cooldown: 0.05 });
    enemy.userData.hit = true;
    enemy.userData.active = false;
    const boom = makeAtlasSprite("explosion", enemy.userData.type === "heavy" ? 2.4 : 1.65, enemy.userData.type === "heavy" ? 1.8 : 1.25);
    boom.position.set(enemy.position.x, 1.05, enemy.position.z);
    boom.userData = { effect: true, ttl: 0.34 };
    projectileGroup.add(boom);
    projectiles.push(boom);
    enemy.visible = false;
    addCoins(enemy.userData.reward);
  }
}

function damageDecrementGate(gate, amount) {
  if (!gate.userData.active) return;
  gate.userData.hp = Math.max(0, gate.userData.hp - amount);
  gate.userData.flash = 0.13;
  playSound("gateHit", { intensity: amount / 10, cooldown: 0.045 });
  updateHpLabel(gate.userData.label, gate.userData.hp);
  const ratio = gate.userData.hp / gate.userData.maxHp;
  gate.userData.panel.material.opacity = 0.48 + ratio * 0.34;
  gate.userData.panel.scale.x = 0.72 + ratio * 0.28;
  if (gate.userData.hp <= 0) {
    gate.userData.hit = true;
    gate.userData.active = false;
    gate.visible = false;
    playSound("gateBreak", { cooldown: 0.12 });
    const shatter = makeAtlasSprite("explosion", 1.9, 1.35);
    shatter.material.color.setHex(0x73e8ff);
    shatter.position.set(gate.position.x, 1.25, gate.position.z);
    shatter.userData = { effect: true, ttl: 0.34 };
    projectileGroup.add(shatter);
    projectiles.push(shatter);
    unlockRewardIfReady(gate.userData.rewardId);
  }
}

function damageBoss(amount, projectile = null) {
  const bossType = currentBossType();
  let remainingDamage = amount;
  if (state.bossShieldHp > 0) {
    const shieldMultiplier = projectile?.userData.weaponId === "carbine" ? 0.62 : projectile?.userData.weaponId === "rifle" ? 0.82 : 1.18;
    const shieldDamage = Math.min(state.bossShieldHp, remainingDamage * shieldMultiplier);
    state.bossShieldHp = Math.max(0, state.bossShieldHp - shieldDamage);
    remainingDamage = Math.max(0, remainingDamage - shieldDamage * 0.45);
    updateShieldBar(bossShieldBar, state.bossShieldHp, state.maxBossShieldHp);
    setBossVisualState("shield", 0.12);
    if (state.bossShieldHp <= 0 && state.maxBossShieldHp > 0) {
      state.shakeTimer = Math.max(state.shakeTimer, 0.34);
      playSound("bossShieldBreak", { cooldown: 0.5 });
      showToast(`${bossType?.name ?? "Boss"} Shield Broken`);
      const burst = makeAtlasSprite("explosion", 3.2, 2.2);
      burst.material.color.setHex(0x73e8ff);
      burst.position.set(boss.position.x, 2.2, boss.position.z + 0.4);
      burst.userData = { effect: true, ttl: 0.48 };
      projectileGroup.add(burst);
      projectiles.push(burst);
    }
  }
  state.bossHp = Math.max(0, state.bossHp - remainingDamage);
  state.hitFlashTimer = 0.14;
  if (state.bossShieldHp > 0) playSound("bossShield", { cooldown: 0.07 });
  setBossVisualState("hit", 0.11);
  bossFill.style.width = `${(state.bossHp / state.maxBossHp) * 100}%`;
  updateHpLabel(boss.userData.label, state.bossHp);
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    if (projectile.userData.effect) {
      projectile.userData.ttl -= dt;
      projectile.scale.multiplyScalar(1 + dt * (projectile.userData.ring ? 6.5 : 2.2));
      projectile.material.opacity = Math.max(0, projectile.userData.ttl / (projectile.userData.ring ? 0.42 : 0.34));
      if (projectile.userData.ttl <= 0) {
        projectileGroup.remove(projectile);
        projectiles.splice(i, 1);
      }
      continue;
    }

    if (!projectile.userData.alive) {
      projectileGroup.remove(projectile);
      projectiles.splice(i, 1);
      continue;
    }

    if (projectile.userData.hostile) {
      projectile.userData.ttl -= dt;
      projectile.userData.previousPosition?.copy(projectile.position);
      projectile.position.add(projectile.userData.velocity.clone().multiplyScalar(dt));
      const previous = projectile.userData.previousPosition ?? projectile.position;
      const segment = reusableVectors.one.copy(projectile.position).sub(previous);
      const squadPoint = reusableVectors.two.set(squadGroup.position.x, 0.75, squadGroup.position.z);
      const toSquad = new THREE.Vector3().copy(squadPoint).sub(previous);
      const segmentLengthSq = Math.max(0.0001, segment.lengthSq());
      const t = THREE.MathUtils.clamp(toSquad.dot(segment) / segmentLengthSq, 0, 1);
      const closest = previous.clone().add(segment.multiplyScalar(t));
      const hitRadius = projectile.userData.radius + (projectile.userData.hitPadding ?? (projectile.userData.bossShot ? 1.05 : 0.78));
      if (closest.distanceTo(squadPoint) < hitRadius) {
        damagePlayer(projectile.userData.damage);
        projectileGroup.remove(projectile);
        projectiles.splice(i, 1);
        continue;
      }
      if (projectile.userData.ttl <= 0 || projectile.position.z > squadGroup.position.z + 6) {
        projectileGroup.remove(projectile);
        projectiles.splice(i, 1);
      }
      continue;
    }

    if (!projectile.userData.target.visible) {
      projectileGroup.remove(projectile);
      projectiles.splice(i, 1);
      continue;
    }

    const target = projectile.userData.target;
    const targetPos = reusableVectors.one;
    target.getWorldPosition(targetPos);
    targetPos.y += target === boss ? 1.45 : 0.8;
    const direction = targetPos.sub(projectile.position);
    const distance = direction.length();

    if (distance < 0.55) {
      if (target === boss) {
        damageBoss(projectile.userData.damage, projectile);
      } else if (target.userData.type === "decrementGate") {
        damageDecrementGate(target, projectile.userData.damage);
      } else {
        damageEnemy(target, projectile.userData.damage);
      }
      projectileGroup.remove(projectile);
      projectiles.splice(i, 1);
      continue;
    }

    projectile.position.add(direction.normalize().multiplyScalar(projectile.userData.speed * dt));
    projectile.scale.setScalar(1 + Math.sin(performance.now() * 0.03) * 0.18);
  }
}

function activateVisibleBoss() {
  if (state.bossVisibleActive || state.phase !== "running" || state.bossHp <= 0) return;
  state.bossVisibleActive = true;
  state.bossAttackTimer = 0.75;
  state.bossTurretTimer = 0.22;
  state.bossTurretIndex = 0;
  state.bossWindupTimer = 0.2;
  bossPanel.style.display = "flex";
  playSound("bossIntro", { cooldown: 0.8 });
  showToast("Boss Spotted");
}

function updateRunning(dt) {
  state.distance += state.speed * dt;
  state.playerZ = -state.distance;
  state.playerX = THREE.MathUtils.lerp(state.playerX, state.targetX, 1 - Math.pow(0.001, dt));
  state.playerX = THREE.MathUtils.clamp(state.playerX, -laneWidth / 2 + 0.55, laneWidth / 2 - 0.55);

  squadGroup.position.set(state.playerX, 0, state.playerZ);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.playerX * 0.32, 0.08);
  camera.position.z = state.playerZ + 13;
  if (state.shakeTimer > 0) {
    state.shakeTimer -= dt;
    camera.position.x += (Math.random() - 0.5) * 0.12;
    camera.position.y += (Math.random() - 0.5) * 0.08;
  }
  camera.lookAt(state.playerX * 0.25, 0.95, state.playerZ - 8.2);

  const squadFront = state.playerZ - 0.35;
  gates.forEach((gate) => {
    if (gate.userData.hit) return;
    const closeZ = Math.abs(squadFront - gate.position.z) < 1.2;
    const closeX = Math.abs(state.playerX - gate.position.x) < gate.userData.width / 2;
    if (closeZ && closeX) resolveGate(gate);
  });

  collidables.forEach((obstacle) => {
    if (obstacle.userData.hit) return;
    const closeZ = Math.abs(squadFront - obstacle.position.z) < 1.1;
    const closeX = Math.abs(state.playerX - obstacle.position.x) < obstacle.userData.width / 2 + 0.55;
    if (closeZ && closeX) resolveObstacle(obstacle);
  });

  coins.forEach((coin) => {
    if (coin.userData.hit) return;
    if (Math.abs(squadFront - coin.position.z) < 0.8 && Math.abs(state.playerX - coin.position.x) < 0.8) {
      collectCoin(coin);
    }
  });

  weaponPickups.forEach((pickup) => {
    if (pickup.userData.hit) return;
    if (Math.abs(squadFront - pickup.position.z) < 1.25 && Math.abs(state.playerX - pickup.position.x) < 1.05) {
      collectWeaponPickup(pickup);
    }
  });

  rewardPickups.forEach((pickup) => {
    if (pickup.userData.hit || pickup.userData.locked) return;
    if (Math.abs(squadFront - pickup.position.z) < 1.25 && Math.abs(state.playerX - pickup.position.x) < 1.05) {
      collectRewardPickup(pickup);
    }
  });

  decrementGates.forEach((gate) => {
    if (!gate.userData.active) return;
    const passedAlive = gate.position.z > state.playerZ + 1.1;
    if (passedAlive) {
      gate.userData.active = false;
      gate.userData.hit = true;
      gate.visible = false;
    }
  });

  enemies.forEach((enemy) => {
    if (!enemy.userData.active) return;
    const passedAlive = enemy.position.z > state.playerZ - 0.7;
    if (passedAlive) {
      state.failReason = "Enemy Breach";
      finishRun(false);
    }
  });

  updateEnemyShooting(dt);
  if (state.playerZ > boss.position.z && state.playerZ - boss.position.z <= bossVisibleActivationRange) activateVisibleBoss();
  updateBossAttacks(dt);
  shootAtTarget(dt);
  if (state.ammo <= 0) {
    finishRun(false);
    return;
  }

  if (state.playerZ <= finishZ) {
    state.phase = "boss";
    state.bossVisibleActive = false;
    state.bossAttackTimer = 0.16;
    state.bossTurretTimer = 0.12;
    state.bossTurretIndex = 0;
    state.bossWindupTimer = 0.12;
    bossPanel.style.display = "flex";
    stopLoop("run");
    startLoop("boss");
    playSound("bossIntro", { cooldown: 0.5 });
    showToast("Boss Fight");
  }
}

function updateBossFight(dt) {
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, bossZ + 13, 0.04);
  if (state.shakeTimer > 0) {
    state.shakeTimer -= dt;
    camera.position.x += (Math.random() - 0.5) * 0.14;
    camera.position.y += (Math.random() - 0.5) * 0.09;
  }
  camera.lookAt(0, 1.2, bossZ - 2);
  squadGroup.position.z = THREE.MathUtils.lerp(squadGroup.position.z, bossZ + 5.2, 0.04);
  state.playerX = THREE.MathUtils.lerp(state.playerX, state.targetX, 1 - Math.pow(0.001, dt));
  state.playerX = THREE.MathUtils.clamp(state.playerX, -laneWidth / 2 + 0.55, laneWidth / 2 - 0.55);
  squadGroup.position.x = state.playerX;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.playerX * 0.22, 0.06);
  const bossType = currentBossType();
  const t = performance.now() * 0.001;
  boss.rotation.y += dt * (state.bossEnraged ? 1.25 : 0.75);
  boss.position.y = Math.sin(t * (state.bossEnraged ? 9 : 6)) * (state.bossEnraged ? 0.12 : 0.06);
  if (bossType?.id === "hoverMech") {
    boss.position.x = Math.sin(t * 2.4) * 1.65;
  } else if (bossType?.id === "cyberBeast") {
    boss.position.x = Math.sin(t * 5.2) * 0.82 + Math.sin(t * 2.1) * 0.45;
  } else {
    boss.position.x = THREE.MathUtils.lerp(boss.position.x, 0, 0.04);
  }

  updateBossAttacks(dt);
  shootAtTarget(dt);
  if (state.bossHp <= 0) {
    setBossVisualState("death", 0.5);
    boss.scale.setScalar(Math.max(0.1, boss.scale.x - dt * 2.5));
    if (boss.scale.x <= 0.14) finishRun(true);
  } else if (state.ammo <= 0 && projectiles.length === 0) {
    finishRun(false);
  }
}

function updateWorld(dt) {
  state.invulnerableTimer = Math.max(0, state.invulnerableTimer - dt);

  gates.forEach((gate) => {
    gate.children.forEach((child) => {
      if (child.isSprite) child.quaternion.copy(camera.quaternion);
    });
    gate.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
  });

  decrementGates.forEach((gate) => {
    gate.children.forEach((child) => {
      if (child.isSprite) child.quaternion.copy(camera.quaternion);
    });
    if (gate.userData.flash > 0) {
      gate.userData.flash -= dt;
      gate.scale.setScalar(1.08);
    } else {
      const pulse = 1 + Math.sin(performance.now() * 0.006 + gate.position.z) * 0.018;
      gate.scale.lerp(new THREE.Vector3(pulse, 1, pulse), 0.1);
    }
  });

  enemies.forEach((enemy) => {
    enemy.children.forEach((child) => {
      if (child.isSprite) child.quaternion.copy(camera.quaternion);
    });
    const shootable = enemy.userData.active && enemyIsShootable(enemy);
    if (shootable && !enemy.userData.lockState) {
      enemy.userData.lockState = true;
      enemy.userData.lockPulse = 0.28;
      enemy.scale.setScalar(1.08);
    } else if (!shootable) {
      enemy.userData.lockState = false;
    }
    if (enemy.userData.label?.material) {
      enemy.userData.label.material.opacity = shootable ? 1 : 0.52;
    }
    if (enemy.userData.lockPulse > 0) {
      enemy.userData.lockPulse -= dt;
      enemy.userData.warning.material.opacity = Math.max(enemy.userData.warning.material.opacity, enemy.userData.lockPulse * 1.8);
    }
    if (enemy.userData.flash > 0) {
      enemy.userData.flash -= dt;
      enemy.scale.setScalar(1.12);
    } else {
      enemy.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
    if (enemy.userData.warning && enemy.userData.shootWindup <= 0) {
      enemy.userData.warning.material.opacity = THREE.MathUtils.lerp(enemy.userData.warning.material.opacity, 0, 0.18);
    }
  });

  boss.userData.label.quaternion.copy(camera.quaternion);
  if (boss.userData.shieldBar) boss.userData.shieldBar.quaternion.copy(camera.quaternion);
  if (boss.userData.aura) {
    boss.userData.aura.material.opacity = (state.bossEnraged ? 0.44 : 0.24) + Math.sin(performance.now() * 0.01) * 0.08;
    boss.userData.aura.scale.setScalar(state.bossEnraged ? 1.18 : 1);
  }
  if (boss.userData.visualTimer > 0) {
    boss.userData.visualTimer -= dt;
    if (boss.userData.visualTimer <= 0 && state.bossHp > 0) restoreBossIdleVisual();
  }
  if (squadAmmoLabel) squadAmmoLabel.quaternion.copy(camera.quaternion);
  if (squadTierLabel) squadTierLabel.quaternion.copy(camera.quaternion);
  if (state.hitFlashTimer > 0) {
    state.hitFlashTimer -= dt;
    boss.scale.multiplyScalar(1.002);
  }

  collidables.forEach((obstacle, i) => {
    obstacle.rotation.y += dt * (0.62 + i * 0.08);
    obstacle.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
  });

  coins.forEach((coin) => {
    if (!coin.userData.hit) {
      coin.material.rotation += dt * 2.8;
      coin.position.y = 0.9 + Math.sin(performance.now() * 0.004 + coin.position.z) * 0.08;
    }
  });

  rewardPickups.forEach((pickup) => {
    if (pickup.visible && !pickup.userData.hit) {
      pickup.rotation.y += dt * 1.2;
      pickup.position.y = Math.sin(performance.now() * 0.004 + pickup.position.z) * 0.09;
      pickup.children.forEach((child) => {
        if (child.isSprite) child.quaternion.copy(camera.quaternion);
      });
    }
  });

  squadMembers.forEach((member, i) => {
    const weapon = currentWeapon();
    const tier = state.weaponIndex;
    const controller = member.userData.controller;
    if (member.userData.flashTimer > 0 || weapon.id !== "carbine") controller.setState("shootRun");
    else controller.setState("run");
    if (member.userData.lastWeaponId !== weapon.id) {
      member.userData.lastWeaponId = weapon.id;
      controller.setState("upgrade", { lockFor: 0.32, restart: true });
      member.userData.flash.visible = true;
      member.userData.flashTimer = 0.16;
      member.userData.aura.scale.setScalar(1.45);
    }
    const frame = controller.update(dt);
    const tierFrame = `t${tier}_${frame}`;
    if (member.userData.sprite.userData.frame !== tierFrame) setRunnerFrame(member.userData.sprite, tierFrame);
    member.userData.aura.material.color.setHex(weapon.color);
    member.userData.aura.material.opacity = 0.18 + state.weaponIndex * 0.05 + Math.sin(performance.now() * 0.008 + i) * 0.08;
    const targetAuraScale = 0.92 + state.weaponIndex * 0.12;
    member.userData.aura.scale.lerp(new THREE.Vector3(targetAuraScale, targetAuraScale, targetAuraScale), 0.12);
    member.rotation.z = Math.sin(performance.now() * 0.006 + i) * 0.012;
    member.position.y = THREE.MathUtils.lerp(member.position.y, 0, 0.18);
    if (member.userData.flashTimer > 0) {
      member.userData.flashTimer -= dt;
      member.userData.flash.visible = member.userData.flashTimer > 0;
    }
  });

  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    toastEl.style.opacity = `${Math.min(1, state.toastTimer * 2)}`;
    toastEl.style.transform = `translate(-50%, ${Math.round((0.85 - state.toastTimer) * -18)}px)`;
  } else {
    toastEl.textContent = "";
  }
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

let pointerActive = false;
let pointerStartX = 0;
let startTargetX = 0;

function onPointerDown(event) {
  pointerActive = true;
  pointerStartX = event.clientX;
  startTargetX = state.targetX;
}

function onPointerMove(event) {
  if (!pointerActive) return;
  const delta = (event.clientX - pointerStartX) / Math.max(1, window.innerWidth);
  state.targetX = THREE.MathUtils.clamp(startTargetX + delta * laneWidth * 2.2, -laneWidth / 2 + 0.55, laneWidth / 2 - 0.55);
}

function onPointerUp() {
  pointerActive = false;
}

function onKey(event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.targetX -= 0.8;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.targetX += 0.8;
  state.targetX = THREE.MathUtils.clamp(state.targetX, -laneWidth / 2 + 0.55, laneWidth / 2 - 0.55);
}

shopGrid?.addEventListener("click", (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-upgrade-id]");
  if (!button) return;
  initAudio();
  purchaseUpgrade(button.dataset.upgradeId);
});

startButton.addEventListener("click", startRun);
restartButton.addEventListener("click", () => {
  initAudio();
  playSound("start", { cooldown: 0.2 });
  startLoop("run");
  stopLoop("boss");
  resetRun(restartButton.dataset.next === "true");
  state.phase = "running";
});
audioToggle.addEventListener("click", () => {
  initAudio();
  const enabled = !isAudioEnabled();
  setAudioEnabled(enabled);
  audioToggle.textContent = enabled ? "Sound On" : "Sound Off";
  audioToggle.setAttribute("aria-pressed", `${enabled}`);
  playSound("ui", { cooldown: 0.1 });
});
window.addEventListener("resize", resize);
window.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("keydown", onKey);

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  updateWorld(dt);
  updateProjectiles(dt);
  if (state.phase === "running") updateRunning(dt);
  if (state.phase === "boss") updateBossFight(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

resize();
resetRun(false);
requestAnimationFrame(tick);
