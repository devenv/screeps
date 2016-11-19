var utils = require('Utils');
var config = require('Config');
var setups = require('UnitSetups');

var roles = ['carrier', 'miner', 'global_carrier', 'builder', 'soldier', 'ranged', 'healer'];

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

Spawner.prototype.spawn = function() {
    var self = this;
    this.showStats();
    if(this.spawner !== undefined && !this.spawner.spawning) {
        roles.some(function(role) {
            if(self.shouldSpawn(role) && self.spawnCreep(role)) {
                return true;
            }
        });
    }
}

Spawner.prototype.shouldSpawn = function(role) {
    switch(role) {
        case 'carrier': return this.room.modernCreepsByRole(role).length < this.room.modernCreepsByRole('miner').length + this.room.modernCreepsByRole('builder').length;
        case 'miner':  return this.room.modernCreepsByRole(role).length < this.room.minerSpots() + this.room.neighborsMinerSpots() && this.room.modernCreepsByRole('miner').length < config.max_miners;
        case 'global_carrier': return this.room.modernCreepsByRole(role).length < 1;
        case 'builder': return this.room.modernCreepsByRole(role).length < config.max_builders;
        case 'soldier': return this.room.modernCreepsByRole(role).length < config.max_guards;
        case 'ranged': return this.room.modernCreepsByRole(role).length < config.max_ranged;
        case 'healer': return this.room.modernCreepsByRole(role).length < config.max_healers;
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
    }
    return true;
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