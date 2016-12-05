var utils = require('Utils');
var config = require('Config');

function Extractor(creep) {
  this.creep = creep;
}

Extractor.prototype.act = function() {
  if(this.creep.memory.mode === undefined || this.creep.carry.energy === 0) {
    this.creep.memory.mode = 'extracting';
  }
  if(_.sum(_.values(this.creep.carry)) >= this.creep.carryCapacity) {
    this.creep.memory.mode = 'unload';
  }
  if(this.creep.memory.mode === 'extracting') {
    if(this.creep.memory.deposit === undefined) {
      this.creep.originRoom().find(FIND_MINERALS).some(deposit => {
        var creeps_working = _.values(Game.creeps).filter(creep => creep.memory.level >= this.creep.memory.level && creep.memory.deposit === deposit.id).length;
        if (creeps_working < this.creep.originRoom().countFreeSpots(deposit.pos)) {
          this.creep.memory.deposit = deposit.id;
          return true;
        }
      });
    }

    if(this.creep.memory.deposit !== undefined) {
      var deposit = Game.getObjectById(this.creep.memory.deposit);
      if(this.creep.pos.isNearTo(deposit)) {
        this.creep.harvest(deposit);
      } else {
        this.creep.goTo(deposit);
      }
    }
  } else if (this.creep.memory.mode === 'unload') {
    var terminal = Game.getObjectById(Memory.terminal.id);
    if(this.creep.pos.isNearTo(terminal)) {
      this.creep.transfer(terminal, Object.keys(this.creep.carry)[0]);
    } else {
      this.creep.goTo(terminal);
    }
  }
}

module.exports = Extractor;
