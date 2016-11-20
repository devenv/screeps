var utils = require('Utils');
var config = require('Config');

function Miner(creep) {
  this.creep = creep;
  // this.creep.memory.source = undefined;
}

Miner.prototype.act = function() {
  if(this.creep.memory.mode === undefined) {
    this.creep.memory.mode = 'mining';
  }
  if(this.creep.memory.mode === 'mining') {
    if(this.creep.memory.source === undefined) {
      _.values(Game.rooms).some(room => {
        return room.find(FIND_SOURCES).some(source => {
          var creeps_working = _.values(Game.creeps).filter(creep => creep.memory.source === source.id).length;
          if (creeps_working < room.countFreeSpots(source.pos)) {
            this.creep.memory.source = source.id;
            return true;
          }
        });
      });
    }
    if(this.creep.memory.source !== undefined) {
      var source = Game.getObjectById(this.creep.memory.source);
      if(this.creep.pos.isNearTo(source)) {
        this.creep.harvest(source);
        this.creep.transferToNearby();
        var hasCarrier = this.creep.room.creepsByRole('carrier').filter(creep => creep !== undefined && creep.memory.owner === this.creep.name).length > 0;
        if(this.creep.carry.energy >= this.creep.carryCapacity && !hasCarrier) {
          this.creep.say('unload');
          this.creep.memory.mode = 'unload';
        }
      } else {
        this.creep.goTo(source);
      }
    }
  } else if (this.creep.memory.mode === 'unload') {
    var spawn = this.creep.room.getEnergySink(this.creep);
    if(this.creep.pos.isNearTo(spawn)) {
      this.creep.transfer(spawn, RESOURCE_ENERGY);
      this.creep.memory.mode = 'mining';
    } else {
      this.creep.goTo(spawn.pos);
    }
  }
}

module.exports = Miner;
