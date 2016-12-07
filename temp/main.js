var config = require('Config');
var utils = require('Utils');
var Spawner = require('Spawner');
var Tower = require('Tower');
var Miner = require('Miner');
var Carrier = require('Carrier');
var Builder = require('Builder');
var Soldier = require('Soldier');
var Ranged = require('Ranged');
var Healer = require('Healer');
var Scout = require('Scout');
var Claimer = require('Claimer');
var Extractor = require('Extractor');
var RoomInjections = require('RoomInjections');
var CreepInjections = require('CreepInjections');

module.exports.loop = function() {
  //var cpu = Game.cpu.getUsed();
  var exceptions = [];

  if(Game.time % config.long_update_freq === 1) {
    Game.memory.neighbors_miner_max = _.values(Game.rooms).filter(room => room.controller && room.controller.owner === undefined).map(room => room.minerSpots()).reduce((s, r)=> s += r, 0);
    Game.memory.terminals = _.flatten(_.values(Game.rooms).map(room => room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TERMINAL}})));
  }

  _.values(Game.rooms).forEach(room => {
    try {
      room.init();
      room.update();
      room.longUpdate();
    } catch(e) { console.log(e); exception.push(e); }

    room.towers.forEach(tower => {
      try {
        new Tower(st).act();
      } catch(e) { console.log(e); exception.push(e); }
    });

    room.spawns.forEach(spawn => {
      try {
        new Spawner(spawn).act();
      } catch(e) { console.log(e); exception.push(e); }
    });
  });

  _.values(Game.creeps).forEach(creep => {
    try {
      if(creep.memory.role === 'miner') {
        creep.act(new Miner(creep));
      } else if(creep.memory.role === 'carrier') {
        creep.act(new Carrier(creep));
      } else if(creep.memory.role === 'builder') {
        creep.act(new Builder(creep));
      } else if(creep.memory.role === 'soldier') {
        creep.act(new Soldier(creep));
      } else if(creep.memory.role === 'healer') {
        creep.act(new Healer(creep));
      } else if(creep.memory.role === 'ranged') {
        creep.act(new Ranged(creep));
      } else if(creep.memory.role === 'scout') {
        creep.act(new Scout(creep));
      } else if(creep.memory.role === 'claimer') {
        creep.act(new Claimer(creep));
      } else if(creep.memory.role === 'extractor') {
        creep.act(new Extractor(creep));
      }
      if(creep.memory.stuck === undefined) {
        creep.memory.stuck = 0;
        creep.memory.same_pos = true;
        creep.memory.moved = false;
      }
      creep.memory.stuck++;
      creep.memory.same_pos = creep.memory.same_pos && utils.samePos(creep.memory.last_pos, creep.pos);
    } catch(e) { console.log(e); exception.push(e); }

    try {
        if((creep.memory.moved || Math.random() > 0.9) && creep.memory.same_pos || Math.random() < 1 / (config.twitch_threshold * 10)) {
          creep.twitch();
        }
        creep.memory.same_pos = true;
        creep.memory.moved = false;
        creep.memory.stuck = 0;

        creep.memory.last_pos = creep.pos;
    } catch(e) { console.log(e); exception.push(e); }
  });

  if(exception !== undefined) {
    //Memory.stats['errors'] = 1;
    throw exceptions;
  } else {
    //Memory.stats['errors'] = 0;
  }
  //Memory.stats['cpu.bucket'] = Game.cpu.bucket;
  //Memory.stats['cpu.tick_limit'] = Game.cpu.tickLimit;
  //Memory.stats['cpu.used'] = Game.cpu.getUsed();
}
