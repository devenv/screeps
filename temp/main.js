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
    Memory.neighbors_miner_max = _.values(Game.rooms).filter(room => room.controller && room.controller.owner === undefined).map(room => room.minerSpots()).reduce((s, r)=> s += r, 0);
    Memory.terminal = _.first(_.flatten(_.values(Game.rooms).map(room => room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TERMINAL}}).map(ter => ter.id))));
    Object.keys(Memory.creeps).forEach(name => {
      if(!Game.creeps[name]) {
        Memory.creeps[name] = undefined;
      }
    });
  }

  _.values(Game.rooms).forEach(room => {
    try {
      room.init();
      room.update();
      room.longUpdate();
    } catch(e) { console.log(e); exceptions.push(e); }

    room.towers.forEach(tower => {
      try {
        new Tower(tower).act();
      } catch(e) { console.log(e); exceptions.push(e); }
    });

    room.spawns.forEach(spawn => {
      try {
        new Spawner(spawn).act();
      } catch(e) { console.log(e); exceptions.push(e); }
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
    } catch(e) { console.log(e); exceptions.push(e); }
  });

  //Memory.stats['errors'] = exceptions.length;
  if(exceptions.length > 0) {
    throw exceptions[0];
  }
  //Memory.stats['cpu.bucket'] = Game.cpu.bucket;
  //Memory.stats['cpu.tick_limit'] = Game.cpu.tickLimit;
  //Memory.stats['cpu.used'] = Game.cpu.getUsed();
}
