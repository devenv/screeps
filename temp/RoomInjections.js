var config = require('Config');
var utils = require('Utils');
var setups = require('UnitSetups');

Room.prototype.init = function() {
  if(!this.memory.initialized) {
    var sources = this.find(FIND_SOURCES);
    this.memory.sources = this.find(FIND_SOURCES).length;
    this.memory.spawns = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}});
    this.memory.miner_max = sources.map(src => src.pos).map(pos => utils.countFreeSpots(pos)).reduce((s, spots) => s += spots);
    this.memory.extensions = [];
    this.memory.extractors = [];
    this.memory.creeps = {};
    this.memory.creep_id = 0;
  }
}

Room.prototype.update = function() {
  this.towers = [];
  this.spawns = [];
  this.constructionSites = this.find(FIND_CONSTRUCTION_SITES);
  this.extensions = this.memory.extensions.map(extension => Game.getObjectId(extension));
  this.extractors = this.memory.extractors.map(extractor => Game.getObjectId(extractor));
  this.towers = this.memory.towers.map(tower => Game.getObjectId(tower));
  this.brokenStructures = this.brokenStructures();
  if(this.controller && this.controller.my) {
    this.level = _.min([15, this.extensions.length]);
    this.spawns = this.memory.spawn.map(spawn => Game.spawns[spawn]);
    this.hasSpareEnergy =  this.energyAvailable > this.energyCapacityAvailable * 0.8 || this.energyAvailable > this.memory.miner_cost * 1.2;

    this.creeps = {};
    config.roles.forEach(role => {
      var before = this.creeps[role].length;
      this.creeps[role] = this.memory.creeps[role].filter(name => Game.creeps[name]).filter(creep => creep)
      this.modernCreeps[role] = this.creeps[role].filter(creep => creep.level >= this.level);
      if(before !== this.creeps[role].length) {
        this.memory.creeps[role] = this.creeps[role].map(creep => creep.name);
      }
    });
  }

  this.hostileCreeps = this.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'});
}

Room.prototype.longUpdate = function() {
  if(Game.time % config.long_update_freq === 1) {
    if(this.controller.my) {
      this.memory.extensions = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}).map(ext => ext.id);
      this.memory.miner_cost = setups.cost('miner', _.min([15, _.max([1, this.level])]));
      this.memory.miners_needed = 1 + this.memory.minerSpots + Game.memory.neighbors_miner_max;
      this.memory.carriers_needed = 1 + this.memory.sources + _.min(1, this.memory.towers) + _.min(1, this.memory);
      this.memory.extractors = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTRACTOR}}).map(ext => ext.id);
      this.memory.towers = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).map(ext => ext.id);
    }
  }
}


Room.prototype.getEnergySink = function(creep) {
  return utils.sortByDistance(
    _.first(
      this.extensions.concat(this.spawns, (this.storage && this.storage.store[RESOURCE_ENERGY] < 1000000 ? [this.sotrage] : []))
      .filter(ext => ext.energy < ext.energyCapacity)
    )
  );
}

Room.prototype.getEnergySource = function(creep) {
  return utils.sortByDistance(
    _.first(
      this.extensions.concat(this.spawns, (this.storage && this.storage.store[RESOURCE_ENERGY] < 1000000 ? [this.sotrage] : []))
      .filter(ext => ext.energy > 0)
    )
  );
}

Room.prototype.brokenStructures = function() {
  var flags = this.find(FIND_FLAGS, {filter: {name: 'd'}});
  return this.find(FIND_STRUCTURES, {filter: st => flags.length > 0 && !utils.samePos(st.pos, flags[0].pos) && st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold }).sort((a, b)=> a.hits > b.hits ? 1 : -1);
}
