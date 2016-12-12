var utils = require('Utils');
var config = require('Config');

function Miner(creep) {
  this.creep = creep;
  this.room = this.creep.room;
  // this.creep.memory.source = undefined;
}

Miner.prototype.act = function() {
  if(this.creep.memory.mode === undefined || this.creep.carry.energy === 0) {
    this.creep.memory.mode = 'mining';
  }
  //if(this.creep.carry.energy >= this.creep.carryCapacity) {
    //this.creep.memory.mode = 'unload';
  //}
  if(this.creep.memory.mode === 'mining') {
    if(this.creep.memory.source === undefined) {
      this.creep.say('source?');
      this.creep.originRoom().sources().some(source => {
        var creeps_working = _.values(Game.creeps).filter(creep => creep.memory.level >= this.creep.memory.level && creep.memory.source === source.id).length;
        if (creeps_working < utils.countFreeSpots(source.pos)) {
          this.creep.memory.source = source.id;
          return true;
        }
      });
      if(this.creep.memory.source === undefined) {
        _.values(Game.rooms).filter(room => room.controller && !room.controller.my).some(room => {
          return room.sources().some(source => {
            var creeps_working = _.values(Game.creeps).filter(creep => creep.level >= this.creep.level && creep.memory.source === source.id).length;
            if (creeps_working < utils.countFreeSpots(source.pos) * _.values(Game.rooms).filter(room => room.controller && room.controller.my).length) {
              this.creep.memory.source = source.id;
              return true;
            }
          });
        });
      }
    }

    if(this.creep.memory.source !== undefined) {
      if(this.creep.carry.energy >= this.creep.carryCapacity) {
        this.creep.memory.sleep = config.miner_sleep;
        return;
      }
      var source = Game.getObjectById(this.creep.memory.source);
      if(this.creep.pos.isNearTo(source)) {
        this.creep.harvest(source);
        this.room.source_containers().forEach(container => this.creep.transfer(container, RESOURCE_ENERGY));
      } else {
        this.creep.goTo(source);
      }
    }
  } else if (this.creep.memory.mode === 'unload') {
    var src = this.creep.originRoom().getEnergySink(this.creep);
    if(this.creep.pos.isNearTo(src)) {
      this.creep.transfer(src, RESOURCE_ENERGY);
    } else {
      this.creep.goTo(src);
    }
  }
}

module.exports = Miner;
