const Constants = require('../shared/constants');
const Utils = require('../shared/utils');
const Player = require('./player');
const Bird = require('./bird');
const applyCollisions = require('./collisions');
const { MAP_SIZE, CHUNK_SIZE } = require('../shared/constants');
const { forEach } = require('lodash');

const CHUNKS_X = Math.floor(MAP_SIZE / CHUNK_SIZE);
const CHUNKS_Y = Math.floor(MAP_SIZE / CHUNK_SIZE);

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.birds = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    
    this.initChunks();
    this.initBirds();

    setInterval(this.update.bind(this), 1000 / 60);
  }

  initChunks() {
    this.chunks = [];
    for (let i = 0; i < CHUNKS_X; i++) {
      this.chunks.push([]);
      for (let j = 0; j < CHUNKS_Y; j++) {
        this.chunks[i][j] = [];
      }
    }
  }

  initBirds() {
    this.birds = [];
    for (let i = 0; i < Constants.BIRD_TOTAL; i++) {
      this.birds.push(
        new Bird(
          null,
          // Utils.random_normal() * MAP_SIZE,
          // Utils.random_normal() * MAP_SIZE,
          Math.random() * MAP_SIZE,
          Math.random() * MAP_SIZE,
          Math.random() * Math.PI * 2,
        ),
      );
    }
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    this.players[socket.id] = new Player(socket.id, username, x, y);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleDirectionUpdate(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }

  handleBoostUpdate(socket, boost) {
    if (this.players[socket.id]) {
      this.players[socket.id].setBoost(boost);
    }
  }

  resetChunks() {
    for (let i = 0; i < CHUNKS_X; i++) {
      for (let j = 0; j < CHUNKS_Y; j++) {
        this.chunks[i][j] = [];
      }
    }
  }

  addChunkBirds() {
    this.birds.forEach(bird => {
      const chunkX = Math.floor(bird.position.x / CHUNK_SIZE);
      const chunkY = Math.floor(bird.position.y / CHUNK_SIZE);
      this.chunks[chunkX][chunkY].push(bird);
    });
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    let totalUpdates = 0;

    // this.birds.forEach(bird => {
    //   bird.update(dt, this.birds);
    //   totalUpdates += this.birds.length;
    // });

    function updateBirds(birds, neighbourBirds) {
      birds.forEach(bird => {
        bird.update(dt, neighbourBirds);
      });
      return neighbourBirds.length;
    }

    for (let i = 0; i < CHUNKS_X; i++) {
      const l = (i - 1 + CHUNKS_X) % CHUNKS_X;
      const r = (i + 1 + CHUNKS_X) % CHUNKS_X;
      for (let j = 0; j < CHUNKS_Y; j++) {
        const t = (j - 1 + CHUNKS_Y) % CHUNKS_Y;
        const b = (j + 1 + CHUNKS_Y) % CHUNKS_Y;
        const birdsInChunk = this.chunks[i][j];

        totalUpdates += updateBirds(birdsInChunk, birdsInChunk);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[l][j]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[r][j]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[i][b]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[i][t]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[l][t]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[r][t]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[r][b]);
        totalUpdates += updateBirds(birdsInChunk, this.chunks[l][b]);
      }
    }
    this.resetChunks();
    this.addChunkBirds();

    console.log('bird comps', totalUpdates, dt);

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(dt);
    });

    // Apply collisions, give players score for hitting bullets
    applyCollisions(Object.values(this.players), this.birds);
    // this.birds = this.birds.filter(bird => !destroyedBirds.includes(bird));

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.position.distanceToSqrd(player.position) <= Constants.VIEW_DISTANCE ** 2,
    );
    const nearbyBirds = this.birds.filter(
      b => b.position.distanceToSqrd(player.position) <= Constants.VIEW_DISTANCE ** 2,
    );

    // console.log(this.birds.length, nearbyBirds.length);

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      birds: nearbyBirds.map(b => b.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
