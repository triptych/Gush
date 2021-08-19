import { k } from "/kaboom.js";
import state from "/state.js";

const input = {
  // first stick
  x: 0,
  y: 0,
  // second stick
  x2: 0,
  y2: 0,
  stickAttack: false,
  // actions
  burp: false,
  attack: false,
  // gamepad state
  gamepadConnected: false,  
};
export default input;

let gamepadIndex = null;
window.addEventListener("gamepadconnected", (e) => {
  input.gamepadConnected = true;
  gamepadIndex = e.gamepad.index;
});
window.addEventListener("gamepaddisconnected", (e) => {
  input.gamepadConnected = false;
  gamepadIndex = null;
});

const getGamepad = () => {
  if (!input.gamepadConnected || gamepadIndex === null) return null;
  let gamepads = [];
  if (navigator.getGamepads) {
    gamepads = navigator.getGamepads();
  } else if (navigator.webkitGetGamepads) {
    gamepads = navigator.webkitGetGamepads();
  }
  return gamepads[gamepadIndex];
};

export const vibrateGamepad = (duration, weakMagnitude, strongMagnitude, startDelay = 0) => {
  const gp = getGamepad();
  if (!gp || !gp.vibrationActuator) return;
  const type = gp.vibrationActuator.type;
  if (!type) return;
  gp.vibrationActuator.playEffect(type, {
    startDelay,
    duration,
    weakMagnitude,
    strongMagnitude,
  });
}

let gamepadMoving = false;
let gamepadAiming = false;
let gamepadAttacking = false;
let gamepadBurping = false;
const gamepadDeadzone = 0.2;
const handleGamepad = () => {
  const gp = getGamepad();
  if (!gp) return;

  
  let stickOneMagnitude = 0;
  if (gp.axes[0] || gp.axes[1]) {
    stickOneMagnitude = Math.sqrt(gp.axes[0]**2 + gp.axes[1]**2);
  }
  if (stickOneMagnitude >= gamepadDeadzone) {
    gamepadMoving = true;
    input.x = gp.axes[0];
    input.y = gp.axes[1];
  } else if (gamepadMoving) {
    gamepadMoving = false;
    input.x = 0;
    input.y = 0;
  }

  if (gp.buttons[0] && gp.buttons[0].pressed) {
    input.attack = true;
    gamepadAttacking = true;
  } else if (gamepadAttacking) {
    input.attack = false;
    gamepadAttacking = false;
  }
  if (gp.buttons[1] && gp.buttons[1].pressed) {
    input.burp = true;
    gamepadBurping = true;
  } else if (gamepadBurping) {
    input.burp = false;
    gamepadBurping = false;
  }

  let stickTwoMagnitude = 0;
  if (gp.axes[2] || gp.axes[3]) {
    stickTwoMagnitude = Math.sqrt(gp.axes[2]**2 + gp.axes[3]**2);
  }
  if (stickTwoMagnitude >= gamepadDeadzone) {
    gamepadAiming = true;
    input.x2 = gp.axes[2];
    input.y2 = gp.axes[3];
    input.stickAttack = true;
  } else if (gamepadAiming) {
    gamepadAiming = false;
    input.x2 = 0;
    input.y2 = 0;
    input.stickAttack = false;
  }
};


let listenerCancelers = [];
export const enableInputListeners = () => {
  listenerCancelers.forEach(c => c());

  const keys = {
    keyUse: null,
    keyBurp: null,
    keyAttack: null,
    keyUp: null,
    keyDown: null,
    keyLeft: null,
    keyRight: null,
  };
  Object.keys(keys).forEach(k => keys[k] = state.get(k));

  // keyboard
  listenerCancelers.push(k.keyDown(keys.keyUp, () => input.y = -1));
  listenerCancelers.push(k.keyRelease(keys.keyUp, () => input.y = 0));
  listenerCancelers.push(k.keyDown("up", () => input.y = -1));
  listenerCancelers.push(k.keyRelease("up", () => input.y = 0));

  listenerCancelers.push(k.keyDown(keys.keyDown, () => input.y = 1));
  listenerCancelers.push(k.keyRelease(keys.keyDown, () => input.y = 0));
  listenerCancelers.push(k.keyDown("down", () => input.y = 1));
  listenerCancelers.push(k.keyRelease("down", () => input.y = 0));

  listenerCancelers.push(k.keyDown(keys.keyLeft, () => input.x = -1));
  listenerCancelers.push(k.keyRelease(keys.keyLeft, () => input.x = 0));
  listenerCancelers.push(k.keyDown("left", () => input.x = -1));
  listenerCancelers.push(k.keyRelease("left", () => input.x = 0));

  listenerCancelers.push(k.keyDown(keys.keyRight, () => input.x = 1));
  listenerCancelers.push(k.keyRelease(keys.keyRight, () => input.x = 0));
  listenerCancelers.push(k.keyDown("right", () => input.x = 1));
  listenerCancelers.push(k.keyRelease("right", () => input.x = 0));

  listenerCancelers.push(k.keyDown(keys.keyAttack, () => input.attack = true));
  listenerCancelers.push(k.keyRelease(keys.keyAttack, () => input.attack = false));

  listenerCancelers.push(k.keyDown(keys.keyBurp, () => input.burp = true));
  listenerCancelers.push(k.keyRelease(keys.keyBurp, () => input.burp = false));

  listenerCancelers.push(k.keyDown(keys.keyUse, () => input.use = true));
  listenerCancelers.push(k.keyRelease(keys.keyUse, () => input.use = false));

  // gamepad
  listenerCancelers.push(k.action(handleGamepad));
};