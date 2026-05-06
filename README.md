# Math Mob Rush

A small Three.js prototype of a hyper-casual math-gate ammo runner.

## Run

```sh
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Controls

- Drag left or right on mobile/desktop to steer.
- Use `A`/`D` or arrow keys on keyboard.

## Prototype Features

- Add, subtract, multiply, and divide ammo gates.
- Neutral blue math gates so the player has to compare the operations instead of following red/green hints.
- Fixed rear-view armed squad visuals so large ammo values do not max out the character count.
- Animation controller for run, shoot-run, upgrade, hit, and weapon states.
- Five distinct player power forms from `assets/player-power-tiers.png`: Recruit, Pulse Trooper, Heavy Gunner, Laser Knight, and Overdrive.
- Weapon pickups that change ammo cost, fire rate, damage, and player form: Carbine, Pulse Rifle, Cannon, Laser, and Overdrive.
- Procedural level generation with neutral gates, weapon pickups, enemy waves, coins, hazards, and boss rotation.
- Theme rotation: neon highway, orbital bridge, lava factory, ice lab, and alien city.
- Enemy pool includes grunts, shield troopers, heavies, drones, and turrets.
- Boss pool rotates between cannon king, hover mech, shield knight, and cyber beast variants.
- Required enemy threats with visible HP/ammo requirements over their heads; if a live enemy reaches the squad, the run ends.
- Player weapons fire continuously at the next enemy, while enemies fire back and drain ammo.
- Weapon-specific projectiles, glow, muzzle flashes, explosions, and camera shake for heavy shots.
- In-world ammo and power-tier labels above the squad.
- Automatic end-level boss fight with a much larger HP/ammo requirement.
