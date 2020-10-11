// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

const { PLAYER_RADIUS, PLAYER_MAX_HP, MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
setCanvasDimensions();

const img = new Image();
img.src = 'assets/bg.jpg';

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 1200 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));

function render() {
  const { me, others, birds } = getCurrentState();
  if (!me) {
    return;
  }

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);

  // Draw all birds
  console.log('hi', birds.length);
  birds.forEach(renderBird.bind(null, me));

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));
}

function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2,
  );
  backgroundGradient.addColorStop(0, 'black');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, canvas.width / 2 - x, canvas.height / 2 - y, MAP_SIZE, MAP_SIZE);
}

// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { xHistory, yHistory } = player;
  const offsetX = canvas.width / 2 - me.x;
  const offsetY = canvas.height / 2 - me.y;

  // Draw ship
  renderBird(me, player);

  // Draw trail
  context.beginPath();
  context.moveTo(offsetX + xHistory[0], offsetY + yHistory[0]);
  for (let i = 1; i < xHistory.length; i++) {
    context.lineTo(offsetX + xHistory[i], offsetY + yHistory[i]);
  }
  context.strokeStyle = 'white';
  context.lineWidth = 5;
  context.stroke();
}

function renderBird(me, bird) {
  const { x, y, direction } = bird;
  const offsetX = canvas.width / 2 - me.x + x;
  const offsetY = canvas.height / 2 - me.y + y;
  const oppositeDirection = direction + Math.PI;

  context.beginPath();
  context.moveTo(offsetX, offsetY);
  context.lineTo(offsetX + Math.sin(oppositeDirection - Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS, offsetY - Math.cos(oppositeDirection - Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS);
  context.lineTo(offsetX + Math.sin(oppositeDirection) * Constants.BIRD_RADIUS * 0.65, offsetY - Math.cos(oppositeDirection) * Constants.BIRD_RADIUS * 0.65);
  context.lineTo(offsetX + Math.sin(oppositeDirection + Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS, offsetY - Math.cos(oppositeDirection + Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS);
  context.fillStyle = 'white';
  context.fill();
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);
}

let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(render, 1000 / 60);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  clearInterval(renderInterval);
  renderInterval = setInterval(renderMainMenu, 1000 / 60);
}
