const Constants = require('../shared/constants');
const Utils = require('../shared/utils');
const Player = require('./player');
const Bird = require('./bird');
const applyCollisions = require('./collisions');
const { MAP_SIZE } = require('../shared/constants');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.birds = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    this.initBirds();
    setInterval(this.update.bind(this), 1000 / 60);
  }

  initBirds() {
    this.birds = [];
    for (let i = 0; i < Constants.BIRD_TOTAL; i++) {
      this.birds.push(
        new Bird(
          null,
          Utils.random_normal() * MAP_SIZE,
          Utils.random_normal() * MAP_SIZE,
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

  handleInput(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bird
    this.birds.forEach(bird => {
      bird.update(dt);
    });

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(dt);
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBirds = applyCollisions(Object.values(this.players), this.birds);
    this.birds = this.birds.filter(bird => !destroyedBirds.includes(bird));

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
      p => p !== player && p.distanceToSqrd(player) <= Constants.VIEW_DISTANCE ** 2,
    );
    const nearbyBirds = this.birds.filter(
      b => b.distanceToSqrd(player) <= Constants.VIEW_DISTANCE ** 2,
    );

    console.log(this.birds.length, nearbyBirds.length);

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
