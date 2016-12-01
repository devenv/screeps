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
      this.creep.originRoom().find(FIND_SOURCES).some(source => {
        var creeps_working = _.values(Game.creeps).filter(creep => creep.memory.level >= this.creep.memory.level && creep.memory.source === source.id).length;
        if (creeps_working < this.creep.originRoom().countFreeSpots(source.pos)) {
          this.creep.memory.source = source.id;
          return true;
        }
      });
    }
    if(this.creep.memory.source === undefined) {
      _.values(Game.rooms).filter(room => room.owner === undefined).some(room => {
        return room.find(FIND_SOURCES).some(source => {
          var creeps_working = _.values(Game.creeps).filter(creep => creep.memory.level >= this.creep.memory.level && creep.memory.source === source.id).length;
          if (creeps_working < room.countFreeSpots(source.pos) * _.values(Game.rooms).filter(room => room.controller.my).length) {
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
    var src = Game.rooms[this.creep.memory.origin_room].getEnergySink(this.creep);
    if(this.creep.pos.isNearTo(src)) {
      this.creep.transfer(src, RESOURCE_ENERGY);
      if(this.creep.carry.energy === 0) {
        this.creep.memory.mode = 'mining';
      }
    } else {
      this.creep.goTo(src);
    }
  }
}

module.exports = Miner;
