var utils = require('Utils');
var config = require('Config');
var setups = require('UnitSetups');

var roles = ['carrier', 'miner', 'global_carrier', 'builder', 'scout', 'soldier', 'ranged', 'healer';

function Spawner(room) {
  this.room = room;
  this.spawner = Game.spawns[this.room.memory.spawn];
  this.level = this.room.level();
  if(this.room.memory.spawn === undefined) {
    this.room.memory.spawn = Object.keys(Game.spawns).filter(function(spawn) { return Game.spawns[spawn].room.name === room.name })[0];
  }
  if(this.room.memory.creep_id === undefined) {
    this.room.memory.creep_id = 0;
  }
};

Spawner.prototype.renewNearbyCreeps = function() {
  if(this.spawner !== undefined && !this.spawner.spawning) {
    var creeps = this.spawner.pos.findInRange(FIND_MY_CREEPS, 1).filter(function(creep) { return creep.hits < config.renew_to_ttl }).sort(function(a, b) { return a.hits > config.critical_ttl ? 1 : -1 });
    if(creeps.length > 0) {
      this.spawner.renewCreep(creeps[0]);
      return true
    }
  }
  return false;
}

Spawner.prototype.spawn = function() {
  if(this.spawner !== undefined && !this.spawner.spawning) {
    this.showStats();
    var self = this;
    return roles.some(function(role) {
      if(self.shouldSpawn(role)) {
        return self.spawnCreep(role);
      }
    });
  }
}

Spawner.prototype.countByRole = function(role, level) {
  return _.values(Game.creeps).filter(function(creep) { return creep.memory.role === role && creep.memory.level >= level }).length;
}

Spawner.prototype.shouldSpawn = function(role) {
  var level = this.room.level();
  switch(role) {
    case 'carrier': return this.countByRole(role, this.room.level())< this.countByRole('miner', level) + this.countByRole('builder', level);
    case 'miner':
      var count = this.countByRole(role, this.room.level());
      return count < this.room.neighborsMinerSpots() && count < config.max_miners;
    case 'global_carrier': return this.countByRole(role, level) < 1;
    case 'builder': return this.countByRole(role, level) < config.max_builders;
    case 'soldier': return this.countByRole(role, level) < config.max_guards;
    case 'ranged': return this.countByRole(role, level) < config.max_ranged;
    case 'healer': return this.countByRole(role, level) < config.max_healers;
    case 'scout': return this.countByRole(role, level) < config.max_scouts;
  }
  return false;
}

Spawner.prototype.spawnCreep = function(role) {
  var id = 1 + this.room.memory.creep_id;
  this.room.memory.creep_id = id;
  var count = this.room.creeps().length;
  var level = _.min([this.level, count < 10 ? count : 1000]);
  if(_.isString(this.spawner.createCreep(setups[role][level], role + "-" + this.room.name + "-" + id, {"role": role, "level": level}))) {
    console.log("spawning " + role);
    return true;
  }
  return false;
}

Spawner.prototype.showStats = function() {
  if(Game.time % 10 === 0) {
    var builders_count = this.room.modernCreepsByRole('builder').length;
    var old_count = this.room.oldCreeps().length;
    var controller = this.room.modernCreepsByRole('builder').filter(function(builder) { return builder.memory.controller}).length;
    var repair = this.room.modernCreepsByRole('builder').filter(function(builder) { return builder.memory.repair}).length;
    console.log("miners: " + this.room.modernCreepsByRole('miner').length + ", carriers: " + this.room.modernCreepsByRole('carrier').length + ", global_carriers: " + this.room.modernCreepsByRole('global_carrier').length + ", builders: " + builders_count + "(" + controller + "/" + (builders_count - controller - repair) + "/" + repair + "), solderis: " +  this.room.modernCreepsByRole('soldier').length + ", ranged: " + this.room.modernCreepsByRole('ranged').length + ", healers: " + this.room.modernCreepsByRole('healer').length + ", old: " + old_count);
  }
}

module.exports = Spawner;
