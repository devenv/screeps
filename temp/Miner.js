var utils = require('Utils');
var config = require('Config');

function Miner(creep) {
  this.creep = creep;
  // this.creep.memory.source = undefined;
}

Miner.prototype.act = function() {
  var self = this;

  if(self.creep.memory.mode === undefined) {
    self.creep.memory.mode = 'mining';
  }
  if(self.creep.memory.mode === 'mining') {
    if(self.creep.memory.source === undefined) {
      _.values(Game.rooms).some(function(room) {
        return room.find(FIND_SOURCES).some(function(source) {
          var creeps_working = _.values(Game.creeps).filter(function(creep) { return creep.memory.source !== undefined && utils.samePos(creep.memory.source, source.pos) }).length;
          if (creeps_working < room.countFreeSpots(source.pos)) {
            this.creep.memory.source = source.pos;
            return true;
          }
        });
      });
    }
    if(self.creep.memory.source !== undefined) {
      var source = self.creep.room.getPositionAt(self.creep.memory.source.x, self.creep.memory.source.y);
      if(self.creep.pos.isNearTo(source)) {
        self.creep.harvest(self.creep.room.lookForAt(LOOK_SOURCES, source)[0]);
        self.creep.transferToNearby();
        var hasCarrier = self.creep.room.creepsByRole('carrier').filter(function(creep) { return creep !== undefined && creep.memory.owner === self.creep.name}).length > 0;
        if(self.creep.carry.energy >= self.creep.carryCapacity && !hasCarrier) {
          self.creep.say('unload');
          self.creep.memory.mode = 'unload';
        }
      } else {
        self.creep.goTo(source);
      }
    }
  } else if (self.creep.memory.mode === 'unload') {
    var spawn = self.creep.room.getEnergySink(self.creep);
    if(self.creep.pos.isNearTo(spawn)) {
      self.creep.transfer(spawn, RESOURCE_ENERGY);
      self.creep.memory.mode = 'mining';
    } else {
      self.creep.goTo(spawn.pos);
    }
  }
}

module.exports = Miner;
