var config = require('Config');
var utils = require('Utils');
var setups = require('UnitSetups');

Room.prototype.init = function() {
  if(!this.memory.initialized) {
    var sources = this.find(FIND_SOURCES);
    this.memory.sources = this.find(FIND_SOURCES).length;
    this.memory.spawns = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}});
    this.memory.miner_max = sources.map(src => src.pos).map(pos => this.countFreeSpots(pos)).reduce((s, spots) => s += spots);
    this.memory.towers = 0;
    this.memory.extensions = {};
    this.memory.extractor = {};
    this.memory.creeps = {};
    this.memory.creep_id = 0;
  }
}

Room.prototype.update = function() {
  this.level = _.min([15, this.extensions.length]);
  this.spawn = Game.spawns[this.memory.spawn];
  this.hasSpareEnergy =  this.energyAvailable > this.energyCapacityAvailable * 0.8 || this.energyAvailable > this.memory.miner_cost * 1.2;

  this.hostileCreeps = this.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'});

  this.creeps = {};
  config.roles.forEach(role => this.creeps[role] = this.memory.creeps[role].map(name => Game.creeps[name]).filter(creep => creep));
  config.roles.forEach(role => this.memory.creeps[role] = this.creeps[role].map(creep => creep.name));
  this.modernCreeps = {};
  config.roles.forEach(role => this.modernCreeps[role] = this.creeps[role].filter(creep => creep.level >= this.level));
  this.constructionSites = this.find(FIND_CONSTRUCTION_SITES);
}

Room.prototype.longUpdate = function() {
  if(Game.time % config.long_update_freq === 1) {
    if(this.controller.my) {
      this.memory.extensions = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
      this.memory.miner_cost = setups.cost('miner', _.min([15, _.max([1, this.level])]));
      this.miners_needed = 1 + this.memory.minerSpots + Game.memory.neighbors_miner_max;
      this.extractors = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTRACTOR}});
    } else {
      this.memory.hostile_spawns = this.find(FIND_HOSTILE_SPAWNS);
    }
  }
}

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

Room.prototype.getEnergySink = function(creep) {
  var extensions = this.extensions();
  extensions.push(this.spawn());
  extensions = extensions.filter(structure => structure.energy < structure.energyCapacity);
  if(this.storage && this.storage.store[RESOURCE_ENERGY] < 1000000) {
    extensions.push(this.storage);
  }
  extensions = extensions.sort((a, b) => creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1);
  if(extensions.length > 0) {
    return extensions[0];
  }
}

Room.prototype.getEnergySource = function(creep) {
  var extensions = this.extensions();
  extensions.push(this.spawn());
  extensions = extensions.filter(structure => structure.energy > 0);
  if(this.storage && this.storage.store[RESOURCE_ENERGY] > 0) {
    extensions.push(this.storage);
  }
  extensions = extensions.sort((a, b) => creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1);
  if(extensions.length > 0) {
    return extensions[0];
  }
}

Room.prototype.carriersNeeded = function() {
  if(!this.controller.my) {
    return 0;
  }
  return 1 + this.memory.sources + _.min(1, this.memory.towers) + _.min(1, this.memory);
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
}
