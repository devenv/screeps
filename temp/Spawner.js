var utils = require('Utils');
var config = require('Config');
var setups = require('UnitSetups');

function Spawner(spawn) {
  this.spawn = spawn;
  this.room = spawn.room;
  this.creepsInRange = this.spawn.pos.findInRange(FIND_MY_CREEPS, 1);
  //this.showStats();
};

Spawner.prototype.act = function() {
  if(!this.spawn.spawning) {
    if(this.renewNearbyCreeps()) { return }
    this.spawnCreeps();
  }
}

Spawner.prototype.renewNearbyCreeps = function() {
  return this.creepsInRange
  .filter(creep => creep.ticksToLive < config.renew_to_ttl)
  .sort((a, b) => a.ticksToLive > config.critical_ttl ? 1 : -1)
  .some(creep => {
    if (this.room.hasSpareEnergy || creep.ticksToLive < config.critical_ttl || creep.memory.role === 'miner') {
      this.spawn.renewCreep(creep);
      return true;
    }
    return false;
  });
}

Spawner.prototype.spawnCreeps = function() {
  if(!this.spawn.spawning) {
    return config.roles.some(role => {
      if(this.shouldSpawn(role)) {
        this.spawnCreep(role);
        return true;
      }
      return false;
    });
  }
}

Spawner.prototype.shouldSpawn = function(role) {
  var level = this.room.level;
  switch(role) {
    case 'miner':
      var miners = this.room.creeps[role].length;
      var carriers = this.room.creeps['carrier'].length;
      return miners < this.room.memory.miners_needed && (miners < 1 || carriers > 0);
    case 'carrier': return this.room.modernCreeps[role].length < this.room.memory.carriers_needed;
    case 'builder': return this.room.modernCreeps[role].length < config.max_builders;
    case 'soldier': return this.room.modernCreeps[role].length < config.max_guards;
    case 'ranged': return this.room.modernCreeps[role].length < config.max_ranged;
    case 'healer': return this.room.modernCreeps[role].length < config.max_healers;
    case 'scout': return this.room.modernCreeps[role].length < config.max_scouts;
    case 'extractor': return Memory.terminal && this.room.memory.extractors.length > 0 && this.room.modernCreeps[role].length < 1;
  }
  return false;
}

Spawner.prototype.spawnCreep = function(role) {
  var id = 1 + this.room.memory.creep_id;
  this.room.memory.creep_id = id;
  var level = _.max([1, _.min([this.room.level, this.room.creeps[role].length < 1 ? 1 : 1000])]);
  var res = this.spawn.createCreep(setups[role][level], role + "-" + level + "-" + this.room.name + "-" + id, {"role": role, "level": level, "origin_room": this.room.name});
  if(_.isString(res)) {
    //Memory.stats[this.room.name + '.spawning'] = 1;
    console.log(this.room.name + ": spawning " + role + " - " + res);
  } else {
    //Memory.stats[this.room.name + '.spawning'] = 0;
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
  var extractors = this.room.modernCreepsByRole('extractors').length;
  Memory.stats[this.room.name + '.creeps.miners'] = miners;
  Memory.stats[this.room.name + '.creeps.carriers'] = carriers;
  Memory.stats[this.room.name + '.creeps.builders'] = builders_count - controller - repair;
  Memory.stats[this.room.name + '.creeps.controller_upgraders'] = controller;
  Memory.stats[this.room.name + '.creeps.repair'] = repair;
  Memory.stats[this.room.name + '.creeps.soldiers'] = soldiers;
  Memory.stats[this.room.name + '.creeps.ranged'] = ranged;
  Memory.stats[this.room.name + '.creeps.healers'] = healers;
  Memory.stats[this.room.name + '.creeps.scouts'] = scouts;
  Memory.stats[this.room.name + '.creeps.extractors'] = extractors;
  Memory.stats[this.room.name + '.creeps.old'] = old_count;
  Memory.stats[this.room.name + '.energy.spawn'] = this.spawn.energy;
  Memory.stats[this.room.name + '.energy.towers'] = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}).map(st => st.energy).reduce((s, e) => s += e, 0);
  Memory.stats[this.room.name + '.progress.controller'] = this.room.controller.progress / this.room.controller.progressTotal;

  Memory.stats[this.room.name + '.energy.room'] = this.room.energyAvailable;
  Memory.stats[this.room.name + '.energy.containers'] = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).map(st => _.sum(st.store)).reduce((s, e) => s += e, 0);
  Memory.stats[this.room.name + '.energy.creeps'] = _.values(Game.creeps).filter(creep => creep.carryCapacity > 0).map(creep => creep.energy).reduce((s, e) => s += e, 0);
  if(Game.time % 10 === 0) {
    console.log(this.room.name + " - miners: " + miners + ", carriers: " + carriers + ", builders: " + builders_count + "(" + controller + "/" + (builders_count - controller - repair) + "/" + repair + "), solderis: " + soldiers  + ", ranged: " + ranged + ", healers: " + healers + ", old: " + old_count);
  }
}

module.exports = Spawner;
