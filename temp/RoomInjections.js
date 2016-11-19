var config = require('Config');
var utils = require('Utils');

Room.prototype.level = function() {
  return _.min([15, this.extensions().length]);
}

Room.prototype.findHostiles = function() {
  return this.find(FIND_HOSTILE_CREEPS, {filter: function(t) { return t.name !== 'Source Keeper' }});
}

Room.prototype.findHostileSpawn = function() {
  return this.find(FIND_HOSTILE_SPAWNS);
}

Room.prototype.extensions = function() {
  return this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
}

Room.prototype.creepsByRole = function(role) {
  return this.find(FIND_MY_CREEPS, {filter:  function(creep) { return creep.memory.role === role }});
}

Room.prototype.creeps = function(role) {
  var self = this;
  return this.find(FIND_MY_CREEPS);
}

Room.prototype.modernCreepsByRole = function(role) {
  var self = this;
  return this.find(FIND_MY_CREEPS, {filter:  function(creep) { return creep.memory.role === role }}).filter(function(creep) { return creep.memory.level >= self.level() });
}

Room.prototype.oldCreeps = function() {
  var self = this;
  return this.find(FIND_MY_CREEPS, {filter:  function(creep) { return creep.memory.level < self.level() }});
}

Room.prototype.sites = function() {
  return this.find(FIND_CONSTRUCTION_SITES);
}

Room.prototype.countFreeSpots = function(pos) {
  var creep = this;
  var check = function(dx, dy) {
    return Game.map.getTerrainAt(pos.x + dx, pos.y + dy, creep.name) !== 'wall';
  };
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

Room.prototype.spawn = function() {
  return Game.spawns[this.memory.spawn];
}

Room.prototype.getEnergySink = function(creep) {
  var spawn = this.spawn();
  var extensions = this.extensions()
  .filter(function(structure) { return structure.energy < structure.energyCapacity})
  .sort(function(a, b) { return creep.pos.getRangeTo(a) > creep.pos.getRangeTo(b) ? 1 : -1});
  if(extensions.length > 0) {
    if(creep.pos.getRangeTo(extensions[0]) > creep.pos.getRangeTo(spawn)) {
      return spawn;
    } else {
      return extensions[0];
    }
  } else {
    return spawn;
  }
}

Room.prototype.minerSpots = function() {
  var self = this;
  if(this.memory.miner_max === undefined) {
    var sources = this.find(FIND_SOURCES);
    var max = Object.keys(sources).map(function(source) { return self.countFreeSpots(sources[source].pos) }).reduce(function(s, spots) { return s += spots });
    console.log(max);
    this.memory.miner_max = max;
  }
  return this.memory.miner_max;
}

Room.prototype.neighborsMinerSpots = function() {
  if(this.memory.neighbors_miner_max === undefined) {

    _.values(Game.map.describeExits(this.name)).map(function(name) { return Game.rooms[name] }).filter(function(obj) { return obj !== undefined });
    this.memory.neighbors_miner_max = rooms.map(function(room) { return room.minerSpots() }).reduce(function(s, r) { return s += r }, 0);
    console.log(this.memory.neighbors_miner_max)
  }
  return this.memory.neighbors_miner_max;
}

Room.prototype.brokenStructures = function() {

  var flags = this.find(FIND_FLAGS, {filter: {name: 'd'}});
  if(flags.length > 0) {
    return this.find(FIND_STRUCTURES, {filter:function(st) { return !utils.samePos(st.pos, flags[0].pos) && st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold }}).sort(function(a, b) { return a.hits > b.hits ? 1 : -1});
  } else {
    return this.find(FIND_STRUCTURES, {filter:function(st) { return st.structureType === STRUCTURE_CONTAINER && st.hits < st.hitsMax || st.hits < config.min_repair && st.hits / st.hitsMax < config.structures_repair_threshold }}).sort(function(a, b) { return a.hits > b.hits ? 1 : -1});
  }

}
