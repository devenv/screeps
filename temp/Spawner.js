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
  if(this.spawner) {
    if (this.room.hasSpareEnergy()) {
      var creeps = this.spawner.pos.findInRange(FIND_MY_CREEPS, 1).filter(creep => creep.ticksToLive < config.renew_to_ttl).sort((a, b) => a.ticksToLive > config.critical_ttl ? 1 : -1);
      if(creeps.length > 0) {
        return creeps.some(creep => this.spawner.renewCreep(creep) === 0);
      }
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
  return _.values(Game.creeps).filter(creep => creep.memory.origin_room === this.room.name && creep.memory.role === role && creep.memory.level >= level).length;
}

Spawner.prototype.shouldSpawn = function(role) {
  var level = this.room.level();
  switch(role) {
    case 'miner':
      var count = this.countByRole(role, level);
      var carriers = this.countByRole('carrier', level);
      return count < this.room.neighborsMinerSpots() && (count < 4 || carriers > 0);
    case 'carrier': return this.countByRole(role, level) < this.room.carriersNeeded();
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
  var level = _.max([1, _.min([this.level, count < 5 ? 1 : 1000])]);
  var res = this.spawner.createCreep(setups[role][level], role + "-" + this.room.name + "-" + id, {"role": role, "level": level});
  if(_.isString(res)) {
    Memory.stats[this.room.name + '.spawning'] = 1;
    console.log("spawning " + role);
  } else {
    Memory.stats[this.room.name + '.spawning'] = 0;
  }
}

Spawner.prototype.showStats = function() {
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
  Memory.stats[this.room.name + '.creeps.miners'] = miners;
  Memory.stats[this.room.name + '.creeps.carriers'] = carriers;
  Memory.stats[this.room.name + '.creeps.builders'] = builders_count - controller - repair;
  Memory.stats[this.room.name + '.creeps.controller_upgraders'] = controller;
  Memory.stats[this.room.name + '.creeps.repair'] = repair;
  Memory.stats[this.room.name + '.creeps.soldiers'] = soldiers;
  Memory.stats[this.room.name + '.creeps.ranged'] = ranged;
  Memory.stats[this.room.name + '.creeps.healers'] = healers;
  Memory.stats[this.room.name + '.creeps.scouts'] = scouts;
  Memory.stats[this.room.name + '.creeps.old'] = old_count;
  if(this.spawner) {
    Memory.stats[this.room.name + '.energy.spawn'] = this.spawner.energy;
    Memory.stats[this.room.name + '.energy.towers'] = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).map(st => st.energy).reduce((s, e) => s += e, 0);
  } else {
    Memory.stats[this.room.name + '.energy.spawn'] = 0;
    Memory.stats[this.room.name + '.energy.towers'] = 0;
  }

  Memory.stats[this.room.name + '.energy.room'] = this.room.energyAvailable;
  Memory.stats[this.room.name + '.energy.containers'] = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).map(st => _.sum(st.store)).reduce((s, e) => s += e, 0);
  Memory.stats[this.room.name + '.energy.creeps'] = _.values(Game.creeps).filter(creep => creep.carryCapacity > 0).map(creep => creep.energy).reduce((s, e) => s += e, 0);
  Memory.stats[this.room.name + '.progress.controller'] = this.room.controller.progress / this.room.controller.progressTotal;
  if(Game.time % 10 === 0) {
    console.log("miners: " + miners + ", carriers: " + carriers + ", builders: " + builders_count + "(" + controller + "/" + (builders_count - controller - repair) + "/" + repair + "), solderis: " + soldiers  + ", ranged: " + ranged + ", healers: " + healers + ", old: " + old_count);
  }
}

module.exports = Spawner;
