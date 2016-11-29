var config = require('Config');
var utils = require('Utils');
var setups = require('UnitSetups');

Room.prototype.level = function() { return _.min([15, this.extensions().length]) };

Room.prototype.findHostiles = function() { return this.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'}) };

Room.prototype.findHostileSpawn = function() { return this.find(FIND_HOSTILE_SPAWNS) };

Room.prototype.extensions = function() { return this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}) };

Room.prototype.creepsByRole = function(role) { return this.find(FIND_MY_CREEPS, {filter:  creep => creep.memory.role === role }) };

Room.prototype.creeps = function(role) { return this.find(FIND_MY_CREEPS) };

Room.prototype.modernCreepsByRole = function(role) { return this.find(FIND_MY_CREEPS, {filter:  creep => creep.memory.role === role}).filter(creep => creep.memory.level >= this.level()) };

Room.prototype.oldCreeps = function() { return this.find(FIND_MY_CREEPS, {filter:  creep => creep.memory.level < this.level() }) };

Room.prototype.sites = function() { return this.find(FIND_CONSTRUCTION_SITES) };

Room.prototype.countFreeSpots = function(pos) {
  var creep = this;
  var check = (dx, dy)=> Game.map.getTerrainAt(pos.x + dx, pos.y + dy, creep.name) !== 'wall';
  var count = 0;
  if(check(-1, -1)) { count++; }
  if(check(0, -1)) { count++; }
  if(check(1, -1)) { count++; }
  if(check(-1, 0)) { count++; }
  if(check(1, 0)) { count++; }
  if(check(-1, 1)) { count++; }
  if(check(0, 1)) { count++; }
  if(check(1, 1)) { count++; }
  return count;
}

Room.prototype.spawn = function() { return Game.spawns[this.memory.spawn] };

Room.prototype.getEnergySink = function(creep) {
  var spawn = this.spawn();
  //if(spawn && spawn.energy < spawn.energyCapacity * 0.8) {
   // return spawn;
  //}
  var extensions = this.extensions()
  .filter(structure => structure.energy < structure.energyCapacity)
  .sort((a, b) => creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1);
  if(extensions.length > 0) {
    if(spawn && creep.pos.getRangeTo(extensions[0]) > creep.pos.getRangeTo(spawn) && spawn.energy < spawn.energyCapacity) {
      return spawn;
    } else {
      return extensions[0];
    }
  } else {
    return spawn;
  }
}

Room.prototype.getEnergySource = function(creep) {
  var spawn = this.spawn();
  var extensions = this.extensions()
  .filter(structure => structure.energy > 0)
  .sort((a, b) => creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1);
  if(extensions.length > 0) {
    if(spawn && creep.pos.getRangeTo(extensions[0]) > creep.pos.getRangeTo(spawn) && spawn.energy > 50) {
      return spawn;
    } else {
      return extensions[0];
    }
  } else {
    return spawn;
  }
}

Room.prototype.carriersNeeded = function() {
  if(!this.controller.my) {
    return 0;
  }
  if(!this.memory.sources) {
    this.memory.sources = this.find(FIND_SOURCES).length;
  }
  return this.memory.sources + 4;
}

Room.prototype.minerSpots = function() {
  if(this.memory.miner_max === undefined) {
    var sources = this.find(FIND_SOURCES);
    var max = Object.keys(sources).map(source => this.countFreeSpots(sources[source].pos)).reduce((s, spots) => s += spots);
    this.memory.miner_max = max;
  }
  return this.memory.miner_max;
}

Room.prototype.neighborsMinerSpots = function() {
  if(Game.time % 10 === 0 || this.memory.neighbors_miner_max === undefined) {
    this.memory.neighbors_miner_max = _.values(Game.rooms).filter(room => room.name === this.name || room.controller.owner === undefined).map(room => room.minerSpots()).reduce((s, r)=> s += r, 0);
  }
  return this.memory.neighbors_miner_max;
}

Room.prototype.brokenStructures = function() {
  var flags = this.find(FIND_FLAGS, {filter: {name: 'd'}});
  if(flags.length > 0) {
    return this.find(FIND_STRUCTURES, {filter: st => !utils.samePos(st.pos, flags[0].pos) && st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold }).sort((a, b)=> a.hits > b.hits ? 1 : -1);
  } else {
    return this.find(FIND_STRUCTURES, {filter: st => st.structureType === STRUCTURE_CONTAINER && st.hits < st.hitsMax || st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold}).sort((a, b)=> a.hits > b.hits ? 1 : -1);
  }

}

Room.prototype.hasSpareEnergy = function() {
  return this.energyAvailable > setups.cost('miner', _.max([15, this.level()])) * 1.2;
}
