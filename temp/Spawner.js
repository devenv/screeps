var utils = require('Utils');
var config = require('Config');
var setups = require('UnitSetups');

var roles = ['miner', 'carrier', 'builder', 'scout', 'soldier', 'ranged', 'healer'];

function Spawner(room) {
  this.room = room;
  this.spawner = Game.spawns[this.room.memory.spawn];
  this.level = this.room.level();
  if(this.room.memory.spawn === undefined) {
    this.room.memory.spawn = Object.keys(Game.spawns).filter(spawn => Game.spawns[spawn].room.name === room.name)[0];
  }
  if(this.room.memory.creep_id === undefined) {
    this.room.memory.creep_id = 0;
  }
};

Spawner.prototype.renewNearbyCreeps = function() {
  if(this.spawner !== undefined && !this.spawner.spawning) {
    var creeps = this.spawner.pos.findInRange(FIND_MY_CREEPS, 1).filter(creep => creep.ticksToLive < config.renew_to_ttl).sort((a, b) => a.ticksToLive > config.critical_ttl ? 1 : -1);
    if(creeps.length > 0) {
      creeps.some(creep => this.spawner.renewCreep(creep) === 0);
      return true
    }
  }
  return false;
}

Spawner.prototype.spawn = function() {
  this.showStats();
  if(this.spawner !== undefined && !this.spawner.spawning) {
    return roles.some(role => {
      if(this.shouldSpawn(role)) {
        this.spawnCreep(role);
        return true;
      }
      return false;
    });
  }
}

Spawner.prototype.countByRole = function(role, level) {
  return _.values(Game.creeps).filter(creep => creep.memory.role === role && creep.memory.level >= level).length;
}

Spawner.prototype.shouldSpawn = function(role) {
  var level = this.room.level();
  switch(role) {
    case 'miner':
      var count = this.countByRole(role, level);
      return count < this.room.neighborsMinerSpots()
    case 'carrier': return this.countByRole(role, level) < _.values(Game.rooms).map(room => room.carriersNeeded()).reduce((s, e) => s+= e, 0)
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
  var level = _.min([this.level, count < 10 ? (count > 0 ? count : 1) : 1000]);
  if(_.isString(this.spawner.createCreep(setups[role][level], role + "-" + this.room.name + "-" + id, {"role": role, "level": level}))) {
    console.log("spawning " + role);
  }
}

Spawner.prototype.showStats = function() {
  if(Game.time % 10 === 0) {
    var builders_count = this.room.modernCreepsByRole('builder').length;
    var old_count = this.room.oldCreeps().length;
    var controller = this.room.modernCreepsByRole('builder').filter(builder => builder.memory.controller).length;
    var repair = this.room.modernCreepsByRole('builder').filter(builder => builder.memory.repair).length;
    var miners = this.room.modernCreepsByRole('miner').length;
    var carriers = this.room.modernCreepsByRole('carrier').length;
    var soldiers = this.room.modernCreepsByRole('soldier').length;
    var ranged = this.room.modernCreepsByRole('ranged').length;
    var healers = this.room.modernCreepsByRole('healer').length;
    var scouts = this.room.modernCreepsByRole('scouts').length;
    Memory.stats['creeps.miners'] = miners;
    Memory.stats['creeps.carriers'] = carriers;
    Memory.stats['creeps.builders'] = builders_count - controller - repair;
    Memory.stats['creeps.controller_upgraders'] = controller;
    Memory.stats['creeps.repair'] = repair;
    Memory.stats['creeps.soldiers'] = soldiers;
    Memory.stats['creeps.ranged'] = ranged;
    Memory.stats['creeps.healers'] = healers;
    Memory.stats['creeps.scouts'] = scouts;
    Memory.stats['creeps.old'] = old_count;
    Memory.stats['energy.spawn'] = this.spawner.energy;
    Memory.stats['energy.room'] = this.room.energyAvailable;
    Memory.stats['energy.towers'] = _.values(Game.structures).filter(st => st.structureType === STRUCTURE_TOWER).map(st => st.energy).reduce((s, e) => s += e, 0);
    Memory.stats['energy.containers'] = _.values(Game.structures).filter(st => st.structureType === STRUCTURE_CONTAINER).map(st => st.energy).reduce((s, e) => s += e, 0);
    Memory.stats['energy.creeps'] = _.values(Game.creeps).filter(creep => creep.carryCapacity > 0).map(creep => creep.energy).reduce((s, e) => s += e, 0);
    Memory.stats['progress.controller'] = this.room.controller.progress / this.room.controller.progressTotal;
    console.log("miners: " + miners + ", carriers: " + carriers + ", builders: " + builders_count + "(" + controller + "/" + (builders_count - controller - repair) + "/" + repair + "), solderis: " + soldiers  + ", ranged: " + ranged + ", healers: " + healers + ", old: " + old_count);
  }
}

module.exports = Spawner;
