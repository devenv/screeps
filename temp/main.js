var debug = true;

var config = require('Config');
var utils = require('Utils');
var Flags = require('Flags');
var Spawner = require('Spawner');
var Tower = require('Tower');
var Miner = require('Miner');
var Carrier = require('Carrier');
var GlobalCarrier = require('GlobalCarrier');
var Builder = require('Builder');
var Soldier = require('Soldier');
var Ranged = require('Ranged');
var Healer = require('Healer');
var RoomInjections = require('RoomInjections');
var CreepInjections = require('CreepInjections');

module.exports.loop = function () {
  var exception;
  Object.keys(Game.rooms).map(function(name) { return Game.rooms[name] }).forEach(function(room) {
    try {
      var spawner = new Spawner(room);
      spawner.spawn();
      var extensions = room.extensions();
      var ext = extensions[Math.floor(Math.random() * extensions.length)];
      var d =  Math.floor(Math.random() * 2) - 1;
      if(ext) {
        room.createConstructionSite(ext.pos.x + d, ext.pos.y + d, STRUCTURE_EXTENSION);
      }
    } catch(e) { console.log(e); exception = e; }
  });
  Object.keys(Game.structures).map(function(st) { return Game.structures[st] }).forEach(function(st) {
    try {
      if(st.structureType === STRUCTURE_TOWER) {
        new Tower(st).act();
      }
    } catch(e) { console.log(e); exception = e; }
  });

  try {
    new Flags().process();
  } catch(e) { console.log(e); exception = e; }

  Object.keys(Game.creeps).forEach(function(cr) {
    try {
      var creep = Game.creeps[cr];
      if(creep.memory.role === 'miner') {
        creep.act(new Miner(creep));
      } else if(creep.memory.role === 'carrier') {
        creep.act(new Carrier(creep));
      } else if(creep.memory.role === 'global_carrier') {
        creep.act(new GlobalCarrier(creep));
      } else if(creep.memory.role === 'builder') {
        creep.act(new Builder(creep));
      } else if(creep.memory.role === 'soldier') {
        creep.act(new Soldier(creep));
      } else if(creep.memory.role === 'healer') {
        creep.act(new Healer(creep));
      } else if(creep.memory.role === 'ranged') {
        creep.act(new Ranged(creep));
      }
      if(creep.memory.stuck === undefined) {
        creep.memory.stuck = 0;
        creep.memory.same_pos = true;
        creep.memory.moved = false;
      }
      creep.memory.stuck++;
      creep.memory.same_pos = creep.memory.same_pos && utils.samePos(creep.memory.last_pos, creep.pos);
    } catch(e) { console.log(e); exception = e; }

    try {
      var forceTwitchFlags = Object.keys(Game.flags).filter(function(flag) { return Game.flags[flag].name === 'twitch' }).map(function(name) { return Game.flags[name] });
      if(forceTwitchFlags.length > 0 || creep.memory.stuck > config.twitch_threshold) {
        if(forceTwitchFlags.length > 0 || (creep.memory.moved || Math.random() > 0.9) && creep.memory.same_pos || Math.random() < 1 / (config.twitch_threshold * 10)) {
          creep.twitch();
        }
        creep.memory.same_pos = true;
        creep.memory.moved = false;
        creep.memory.stuck = 0;
      }
      if(forceTwitchFlags.length > 0) {
        forceTwitchFlags[0].remove();
      }

      creep.memory.last_pos = creep.pos;
    } catch(e) { console.log(e); exception = e; }
  });

  if(exception !== undefined && debug) {
    throw exception;
  }
}
