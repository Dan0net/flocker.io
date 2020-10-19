// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');
const Vec2 = require('../shared/vec2');

const { PLAYER_RADIUS, MAP_SIZE, CHUNK_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
setCanvasDimensions();
const CHUNKS_X = Math.floor(MAP_SIZE / CHUNK_SIZE);
const CHUNKS_Y = Math.floor(MAP_SIZE / CHUNK_SIZE);

const img = new Image();
img.src = 'assets/bg.jpg';

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 2400 / window.innerWidth);
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
  renderBackground(me.positionX, me.positionY);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.positionX, canvas.height / 2 - me.positionY, MAP_SIZE, MAP_SIZE);

  // Draw all birds
  // console.log('hi', birds.length);
  birds.forEach(renderBird.bind(null, me));

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));
}

function renderBackground(x, y) {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundL = canvas.width / 2 - x;
  const backgroundT = canvas.height / 2 - y;
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
  context.drawImage(img, backgroundL, backgroundT, MAP_SIZE, MAP_SIZE);

  for (let i = 0; i < CHUNKS_X; i++) {
    context.beginPath();
    context.moveTo(backgroundL, backgroundT + i * CHUNK_SIZE);
    context.lineTo(backgroundL + MAP_SIZE, backgroundT + i * CHUNK_SIZE);
    context.strokeStyle = 'lightblue';
    context.lineWidth = 1;
    context.stroke();
  }

  for (let i = 0; i < CHUNKS_Y; i++) {
    context.beginPath();
    context.moveTo(backgroundL + i * CHUNK_SIZE, backgroundT);
    context.lineTo(backgroundL + i * CHUNK_SIZE, backgroundT + MAP_SIZE);
    context.strokeStyle = 'lightblue';
    context.lineWidth = 1;
    context.stroke();
  }
}

// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { xHistory, yHistory } = player;
  const offsetX = canvas.width / 2 - me.positionX;
  const offsetY = canvas.height / 2 - me.positionY;

  // Draw trail
  context.beginPath();
  context.moveTo(offsetX + xHistory[0], offsetY + yHistory[0]);
  for (let i = 1; i < xHistory.length; i++) {
    context.lineTo(offsetX + xHistory[i], offsetY + yHistory[i]);
  }
  context.strokeStyle = 'white';
  context.lineWidth = 5;
  context.stroke();

  // Draw ship
  renderBird(me, player);
}

function renderBird(me, bird) {
  const { positionX, positionY, velocityX, velocityY, color } = bird;
  const offsetX = canvas.width / 2 - me.positionX + positionX;
  const offsetY = canvas.height / 2 - me.positionY + positionY;
  const direction = Math.atan2(velocityX, -velocityY);
  

  context.beginPath();
  context.arc(offsetX, offsetY, Constants.BIRD_RADIUS, 0, Math.PI * 2, true);
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.stroke();

  context.beginPath();
  context.moveTo(offsetX + Math.sin(direction) * Constants.BIRD_RADIUS, offsetY - Math.cos(direction) * Constants.BIRD_RADIUS);
  context.lineTo(offsetX + Math.sin(direction + Math.PI - Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS, offsetY - Math.cos(direction + Math.PI - Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS);
  context.lineTo(offsetX + Math.sin(direction + Math.PI) * Constants.BIRD_RADIUS * 0.3, offsetY - Math.cos(direction + Math.PI) * Constants.BIRD_RADIUS * 0.3);
  context.lineTo(offsetX + Math.sin(direction + Math.PI + Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS, offsetY - Math.cos(direction + Math.PI + Constants.BIRD_RADIANS_WIDTH) * Constants.BIRD_RADIUS);
  context.fillStyle = color;
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
