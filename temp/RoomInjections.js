var config = require('Config');
var utils = require('Utils');
var setups = require('UnitSetups');

Room.prototype.init = function() {
  if(!this.memory.initialized) {
    var sources = this.find(FIND_SOURCES);
    if(sources === undefined) { sources = []; }
    this.memory.sources = sources.map(source => source.id);
    this.memory.spawns = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}}).map(spawn => spawn.id);
    this.memory.miner_spots = sources.map(src => src.pos).map(pos => utils.countFreeSpots(pos)).reduce((s, spots) => s += spots);
    this.memory.source_containers = [];
    this.memory.extensions = [];
    this.memory.extractors = [];
    this.memory.towers = [];
    this.memory.creep_id = 0;
    this.memory.initialized = true;
  }
}

Room.prototype.update = function() {
  this.towers = [];
  this.spawns = [];
  this.sources = this.memory.sources.map(source => Game.getObjectById(source));
  this.source_containers = this.memory.source_containers.map(container => Game.getObjectById(container));
  this.controller_container = this.memory.controller_container ? Game.getObjectById(this.memory.controller_container) : undefined;
  this.extensions = this.memory.extensions.map(extension => Game.getObjectById(extension));
  this.extractors = this.memory.extractors.map(extractor => Game.getObjectById(extractor));
  this.towers = this.memory.towers.map(tower => Game.getObjectById(tower));
  this.brokenStructures = this.brokenStructures();
  if(this.controller && this.controller.my) {
    this.level = _.min([15, this.extensions.length]);
    this.spawns = this.memory.spawns.map(spawn => Game.getObjectById(spawn));
    this.hasSpareEnergy =  this.energyAvailable > this.energyCapacityAvailable * 0.8 || this.energyAvailable > this.memory.miner_cost * 1.2;

    this.creeps = {};
    this.modernCreeps = {};
    config.roles.forEach(role => {
      this.creeps[role] = [];
      this.modernCreeps[role] = [];
    });
    this.find(FIND_MY_CREEPS).forEach(creep => this.creeps[creep.memory.role].push(creep.name));
    _.flatten(_.values(this.creeps)).filter(creep => Game.creeps[creep].memory.level >= this.level).forEach(creep => this.modernCreeps[Game.creeps[creep].memory.role] = creep.name);
  }

  this.hostileCreeps = this.find(FIND_HOSTILE_CREEPS, {filter: t => t.name !== 'Source Keeper'});
}

Room.prototype.longUpdate = function() {
  if(Game.time % config.long_update_freq === 1) {
    if(this.controller.my) {
      this.memory.source_containers = _.flatten(this.sources.map(source => source.pos.findInRange(FIND_STRUCTURES, 3, {filter: {structureType: STRUCTURE_CONTAINER}}))).map(container => container.id);
      this.memory.controller_container = this.controller.pos.findInRange(FIND_STRUCTURES, 3, {filter: {structureType: STRUCTURE_CONTAINER}}).map(container => container.id);
      this.memory.extensions = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}).map(ext => ext.id);
      this.memory.miner_cost = setups.cost('miner', _.min([15, _.max([1, this.level])]));
      this.memory.miners_needed = 1 + this.memory.miner_spots + Memory.neighbors_miner_max;
      this.memory.carriers_needed = 1 + this.sources.length + _.min([1, this.towers.length]);
      this.memory.extractors = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTRACTOR}}).map(ext => ext.id);
      this.memory.towers = this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).map(ext => ext.id);
    } else {
      var spawns = this.find(FIND_HOSTILE_SPAWNS);
      if(spawns && spawns.length > 0) {
        this.memory.hostile_spawns = spawns.map(spawn => spawn.id);
      } else {
        this.memory.hostile_spawns = undefined;
      }
    }
  }
}

Room.prototype.getEnergySink = function(creep) {
  return _.first(
    utils.sortByDistance(
      this.extensions.concat(this.spawns, (this.storage && this.storage.store[RESOURCE_ENERGY] < 1000000 ? [this.sotrage] : []))
      .filter(ext => ext)
      .filter(ext => ext.energy < ext.energyCapacity)
    , creep
    )
  );
}

Room.prototype.getEnergySource = function(creep) {
  return _.first(
    utils.sortByDistance(
      this.extensions.concat(this.spawns, (this.storage && this.storage.store[RESOURCE_ENERGY] < 1000000 ? [this.sotrage] : []))
      .filter(ext => ext)
      .filter(ext => ext.energy > 0)
    , creep
    )
  );
}

Room.prototype.brokenStructures = function() {
  var flags = this.find(FIND_FLAGS, {filter: {name: 'd'}});
  return this.find(FIND_STRUCTURES, {filter: st => flags.length > 0 && !utils.samePos(st.pos, flags[0].pos) && st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold }).sort((a, b)=> a.hits > b.hits ? 1 : -1);
}
