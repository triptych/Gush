import { k } from "/kaboom.js";
import { config } from "/config.js";
import { uiUpdateHealth } from "/ui.js";
import { createSword } from "/objects/weapons/sword.js";
import { tween, easing } from "/utils.js";

import hp from "/components/hp.js";

// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

// cached player to prevent any duplicates
let cachedPlayer = null;

const hitReactionTime = 0.33;

// TODO - make these configurable
const burpKey = "b";
const weaponKey = "space";
const moveUpKey = "w";
const moveDownKey = "s";
const moveLeftKey = "a";
const moveRightKey = "d";

/**
 * Add a new player to the game. There can only be one at a time.
 * types: elf_f, elf_m, knight, lizard_f, lizard_m, wizard_f, wizard_m
 */
export const createPlayer = (type, attrs) => {
  if (cachedPlayer) return cachedPlayer;

  const player = k.add([
    k.origin("center"),
    k.sprite(type, { animSpeed: 0.3, noArea: true }),
    k.area(k.vec2(-5, -2), k.vec2(5, 12)),
    k.layer("game"),
    "player",
    "killable",
    {
      dir: k.vec2(0, 0),   // which direction the player is moving
      speed: 77,           // how fast the player moves
      xFlipped: false,     // used to determine which way the player & weapon are facing
      moving: false,       // when true, move player in dir by speed
      forcedMoving: false, // when true, ignore input and move player in dir
      hit: false,          // animation for hit & temporary loss of control
      invulnerable: false, // player is temporarily invulnerable after being hit
      canBurp: true,       // controls how often the player can burp
    },
    hp({ current: 6, max: 6 }),
    ...(attrs ?? []),
  ]);

  const weapon = createSword(player);
  k.keyPress(weaponKey, () => {
    if (player.dead) return;
    weapon.attack();
  });

  // TODO - should these be called every frame, or only change on events?
  const handleAnimation = () => {
    if (player.dead) {
      player.play("hit");
      return;
    }

    const anim = player.curAnim();
    if (player.hit) {
      if (anim !== "hit") {
        const hitTime = 0.5;
        player.play("hit");
        player.animSpeed = hitTime;
        k.wait(hitTime, () => player.hit = false);
      }
    } else if (player.moving) {
      if (anim !== "run") {
        player.play("run");
        player.animSpeed = 0.1;
      }
    } else if (anim !== "idle") {
      player.play("idle");
      player.animSpeed = 0.3;
    }
  };

  const handleMoving = () => {
    if (player.dead) return;
    if (!player.moving && !player.forcedMoving) return;
    if (!player.forcedMoving && !weapon.attacking) {
      player.xFlipped = player.dir.x < 0;
      player.flipX(player.xFlipped);
    }
    player.pos = player.pos.add(player.dir.scale(player.speed * k.dt()));
  };

  const handleCamera = () => {
    const scale = k.width() / config.viewableWidth;
    k.camScale(scale);
    k.camPos(player.pos);
  };

  player.action(() => {
    handleMoving();
    handleAnimation();
    handleCamera();
    weapon.updatePosition();
    player.pushOutAll(); // TODO - find a way to make this more efficient
  });

  k.keyPress(burpKey, () => {
    if (player.dead || !player.canBurp) return;
    player.canBurp = false;
    player.hit = true;
    k.burp();
    k.camShake(7);
    k.wait(1, () => player.canBurp = true);
  });

  const controlMoving = (dir, moving) => {
    if (player.forcedMoving) return;
    player.dir.x = dir.x ?? player.dir.x;
    player.dir.y = dir.y ?? player.dir.y;
    // TODO - store weapon direction based on movement
    //        don't reset it when movement stops
    player.moving = moving;
  };

  // movement keys
  k.keyDown(moveUpKey, () => controlMoving({ y: -1 }, true));
  k.keyRelease(moveUpKey, () => controlMoving({ y: 0 }, false));
  k.keyDown(moveDownKey, () => controlMoving({ y: 1 }, true));
  k.keyRelease(moveDownKey, () => controlMoving({ y: 0 }, false));
  k.keyDown(moveLeftKey, () => controlMoving({ x: -1 }, true));
  k.keyRelease(moveLeftKey, () => controlMoving({ x: 0 }, false));
  k.keyDown(moveRightKey, () => controlMoving({ x: 1 }, true));
  k.keyRelease(moveRightKey, () => controlMoving({ x: 0 }, false));

  // hide off-screen non-player objects to improve performance
  k.action("non-player", (obj) => {
    obj.hidden = player.pos.dist(obj.pos) > config.viewableDist;
  });

  let playerHealing = false;
  player.on("heal", (amt, healedBy) => {
    // show a green healing effect if there's not already one in progress
    if (!playerHealing) {
      playerHealing = true;
      if (!player.color) player.use(k.color(1, 1, 1, 1));
      tween(player, 0.5, {
        "color.r": 0,
        "color.b": 0,
      }, easing.easeOutQuart).then(() => tween(player, 0.5, {
        "color.r": 1,
        "color.b": 1,
      }, easing.easeInQuart)).then(() => {
        player.color = undefined;
        playerHealing = false;
      });
    }

    k.play("glyph-activation", {
      loop: false,
      volume: 0.33,
      speed: 1.33,
    });

    uiUpdateHealth(player.hp(), player.maxHp());
  });

  player.on("hurt", (amt, hurtBy) => {
    if (player.invulnerable) return;

    // push the player in the opposite direction if they ran into something solid
    if (hurtBy.solid) {
      player.moving = false;
      player.forcedMoving = true;
      player.dir = player.pos.sub(hurtBy.pos).unit();
    }

    // temporary invulnerability on hit
    player.hit = true;
    player.invulnerable = true;

    // paint the player & weapon red
    if (!player.color) player.use(k.color(1, 0, 0, 1));
    if (!weapon.color) weapon.use(k.color(1, 0, 0, 1));

    // oof
    k.play("punch-squelch-heavy", {
      loop: false,
      volume: 0.666,
      detune: -100,
    });

    // clear all the hit effects
    k.wait(hitReactionTime, () => {
      player.hit = false;
      player.invulnerable = false;
      player.forcedMoving = false;
      player.dir.x = 0;
      player.dir.y = 0;
      player.color = undefined;
      weapon.color = undefined;
    });

    uiUpdateHealth(player.hp(), player.maxHp());
  });

  // womp womp
  player.on("death", (killedBy) => {
    const playerSlapDir = player.pos.sub(killedBy.pos).unit();
    const weaponSlapDir = weapon.pos.sub(killedBy.pos).unit();

    k.play("punch-intense-heavy", { volume: 0.86 });
    k.wait(0.8, () => k.play("implode"));

    if (!player.angle) player.use(k.rotate(0));
    Promise.all([
      tween(player, 1, {
        "pos.x": player.pos.x + playerSlapDir.x * config.tileWidth,
        "pos.y": player.pos.y + playerSlapDir.y * config.tileHeight,
        "angle": Math.PI / 2,
      }, easing.easeOutQuart),
      tween(weapon, 1, {
        "pos.x": weapon.pos.x + weaponSlapDir.x * (config.tileWidth * 4.44),
        "pos.y": weapon.pos.y + weaponSlapDir.y * (config.tileHeight * 4.44),
        "angle": weapon.angle + Math.PI * 3,
      }, easing.easeOutQuart),
    ]).then(() => {
      k.debug.log("you died");
      // k.go("gameover");
    });

    uiUpdateHealth(player.hp(), player.maxHp());
  });

  // initialize health
  uiUpdateHealth(player.hp(), player.maxHp());

  cachedPlayer = player;
  return cachedPlayer;
};

export const destroyPlayer = () => {
  k.destroy(cachedPlayer);
  cachedPlayer = null;
}